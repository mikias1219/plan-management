import {
  BadRequestException,
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { google } from 'googleapis';
import { Model } from 'mongoose';
import { decryptSecret, encryptSecret } from '../common/utils/crypto.js';
import { oid, ownedBy } from '../common/utils/oid.js';
import { UsersService } from '../users/users.service.js';
import { GoogleToken, GoogleTokenDocument } from './schemas/google-token.schema.js';

const SCOPES = [
  'https://www.googleapis.com/auth/userinfo.email',
  'https://www.googleapis.com/auth/documents',
  'https://www.googleapis.com/auth/drive.file',
];

@Injectable()
export class GoogleService {
  private readonly logger = new Logger(GoogleService.name);

  constructor(
    private readonly config: ConfigService,
    private readonly jwt: JwtService,
    private readonly users: UsersService,
    @InjectModel(GoogleToken.name) private readonly tokens: Model<GoogleTokenDocument>,
  ) {}

  isConfigured() {
    return Boolean(this.config.get('GOOGLE_CLIENT_ID') && this.config.get('GOOGLE_CLIENT_SECRET'));
  }

  async getAuthUrl(userId: string) {
    if (!this.isConfigured()) {
      throw new ServiceUnavailableException('Google is not configured yet');
    }
    const client = this.oauthClient();
    const state = await this.jwt.signAsync(
      { sub: userId, purpose: 'google-oauth' },
      { secret: this.config.getOrThrow('JWT_ACCESS_SECRET'), expiresIn: '10m' },
    );
    const url = client.generateAuthUrl({
      access_type: 'offline',
      prompt: 'consent',
      scope: SCOPES,
      state,
    });
    return { url };
  }

  async handleCallback(code: string, state: string) {
    const payload = await this.jwt.verifyAsync<{ sub: string }>(state, {
      secret: this.config.getOrThrow('JWT_ACCESS_SECRET'),
    });
    const client = this.oauthClient();
    const { tokens } = await client.getToken(code);
    if (!tokens.refresh_token) {
      throw new BadRequestException('Google did not return a refresh token. Reconnect and grant access again.');
    }

    const key = this.config.getOrThrow<string>('TOKEN_ENCRYPTION_KEY');
    await this.tokens.findOneAndUpdate(
      { userId: ownedBy(payload.sub) },
      {
        $set: {
          userId: oid(payload.sub),
          encryptedRefreshToken: encryptSecret(tokens.refresh_token, key),
          encryptedAccessToken: tokens.access_token ? encryptSecret(tokens.access_token, key) : undefined,
          accessTokenExpiresAt: tokens.expiry_date ? new Date(tokens.expiry_date) : undefined,
          scope: tokens.scope,
        },
      },
      { upsert: true },
    );

    client.setCredentials(tokens);
    const oauth2 = google.oauth2({ version: 'v2', auth: client });
    const profile = await oauth2.userinfo.get();
    await this.users.setGoogleAccount(payload.sub, profile.data.email ?? '', tokens.scope ?? SCOPES.join(' '));

    const deepLink = this.config.get('APP_DEEP_LINK', 'lifeos://google-connected');
    return `${deepLink}?ok=1`;
  }

  async isConnected(userId: string) {
    const stored = await this.tokens.findOne({ userId: ownedBy(userId) }).exec();
    return Boolean(stored);
  }

  async status(userId: string) {
    const user = await this.users.getProfile(userId);
    return {
      configured: this.isConfigured(),
      connected: Boolean(user.googleAccount?.connected) && (await this.isConnected(userId)),
      email: user.googleAccount?.email ?? null,
    };
  }

  async disconnect(userId: string) {
    await this.tokens.deleteOne({ userId: ownedBy(userId) }).exec();
    await this.users.clearGoogleAccount(userId);
    return { connected: false };
  }

  async createDocument(userId: string, title: string, content = '') {
    const auth = await this.authorizedClient(userId);
    const drive = google.drive({ version: 'v3', auth });
    const created = await drive.files.create({
      requestBody: {
        name: title,
        mimeType: 'application/vnd.google-apps.document',
      },
      fields: 'id,name,webViewLink',
    });
    const documentId = created.data.id;
    if (!documentId) {
      throw new BadRequestException('Could not create Google Doc');
    }
    if (content) {
      await this.writeDocument(userId, documentId, content);
    }
    return {
      googleDocumentId: documentId,
      googleDriveFileId: documentId,
      webViewLink: created.data.webViewLink ?? undefined,
      title: created.data.name ?? title,
    };
  }

  async listDocuments(userId: string) {
    const auth = await this.authorizedClient(userId);
    const drive = google.drive({ version: 'v3', auth });
    const result = await drive.files.list({
      q: "mimeType='application/vnd.google-apps.document' and trashed=false",
      fields: 'files(id,name,webViewLink,modifiedTime)',
      pageSize: 50,
      orderBy: 'modifiedTime desc',
    });
    return result.data.files ?? [];
  }

  async readDocument(userId: string, documentId: string) {
    const auth = await this.authorizedClient(userId);
    const docs = google.docs({ version: 'v1', auth });
    const doc = await docs.documents.get({ documentId });
    const body = doc.data.body?.content ?? [];
    const text = body
      .map((block) => block.paragraph?.elements?.map((el) => el.textRun?.content ?? '').join('') ?? '')
      .join('');
    return { title: doc.data.title, content: text, documentId };
  }

  async writeDocument(userId: string, documentId: string, content: string) {
    const auth = await this.authorizedClient(userId);
    const docs = google.docs({ version: 'v1', auth });
    const current = await docs.documents.get({ documentId });
    const endIndex = current.data.body?.content?.at(-1)?.endIndex ?? 1;
    const requests = [];
    if (endIndex > 2) {
      requests.push({
        deleteContentRange: {
          range: { startIndex: 1, endIndex: endIndex - 1 },
        },
      });
    }
    requests.push({
      insertText: {
        location: { index: 1 },
        text: content || ' ',
      },
    });
    await docs.documents.batchUpdate({
      documentId,
      requestBody: { requests },
    });
    return { documentId, synced: true };
  }

  private oauthClient() {
    return new google.auth.OAuth2(
      this.config.get('GOOGLE_CLIENT_ID'),
      this.config.get('GOOGLE_CLIENT_SECRET'),
      this.config.get('GOOGLE_REDIRECT_URI'),
    );
  }

  private async authorizedClient(userId: string) {
    if (!this.isConfigured()) {
      throw new ServiceUnavailableException('Google is not configured yet');
    }
    const stored = await this.tokens.findOne({ userId: ownedBy(userId) }).exec();
    if (!stored) {
      throw new BadRequestException('Connect your Google account first');
    }
    const key = this.config.getOrThrow<string>('TOKEN_ENCRYPTION_KEY');
    const client = this.oauthClient();
    client.setCredentials({
      refresh_token: decryptSecret(stored.encryptedRefreshToken, key),
      access_token: stored.encryptedAccessToken
        ? decryptSecret(stored.encryptedAccessToken, key)
        : undefined,
    });
    client.on('tokens', (tokens) => {
      void this.persistRotatedTokens(userId, tokens, key).catch((error) => this.logger.error(error));
    });
    return client;
  }

  private async persistRotatedTokens(
    userId: string,
    tokens: { refresh_token?: string | null; access_token?: string | null; expiry_date?: number | null },
    key: string,
  ) {
    const patch: Record<string, unknown> = {};
    if (tokens.refresh_token) {
      patch.encryptedRefreshToken = encryptSecret(tokens.refresh_token, key);
    }
    if (tokens.access_token) {
      patch.encryptedAccessToken = encryptSecret(tokens.access_token, key);
    }
    if (tokens.expiry_date) {
      patch.accessTokenExpiresAt = new Date(tokens.expiry_date);
    }
    if (Object.keys(patch).length) {
      await this.tokens.updateOne({ userId: ownedBy(userId) }, { $set: patch }).exec();
    }
  }
}
