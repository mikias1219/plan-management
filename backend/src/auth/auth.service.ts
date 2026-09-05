import {
  ConflictException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import bcrypt from 'bcryptjs';
import { Model } from 'mongoose';
import { hashToken, randomToken } from '../common/utils/crypto.js';
import { HabitsService } from '../habits/habits.service.js';
import { LifeAreasService } from '../life-areas/life-areas.service.js';
import { UsersService } from '../users/users.service.js';
import { LoginDto } from './dto/login.dto.js';
import { RegisterDto } from './dto/register.dto.js';
import { AuthSession, AuthSessionDocument } from './schemas/auth-session.schema.js';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly users: UsersService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
    private readonly lifeAreas: LifeAreasService,
    private readonly habits: HabitsService,
    @InjectModel(AuthSession.name) private readonly sessions: Model<AuthSessionDocument>,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.users.findByEmail(dto.email);
    if (existing) {
      throw new ConflictException('An account with this email already exists');
    }

    const passwordHash = await bcrypt.hash(dto.password, 12);
    const user = await this.users.create({
      email: dto.email.toLowerCase(),
      name: dto.name,
      passwordHash,
      timezone: 'UTC',
    });

    await this.lifeAreas.ensureDefaults(String(user._id));
    await this.habits.ensureDefaults(String(user._id));

    return this.issueTokens(String(user._id), user.email, user.name);
  }

  async login(dto: LoginDto) {
    const user = await this.users.findByEmail(dto.email);
    if (!user || !(await bcrypt.compare(dto.password, user.passwordHash))) {
      throw new UnauthorizedException('Invalid email or password');
    }
    await this.lifeAreas.ensureDefaults(String(user._id));
    await this.habits.ensureDefaults(String(user._id));
    return this.issueTokens(String(user._id), user.email, user.name);
  }

  async refresh(refreshToken: string) {
    let payload: { sub: string; email: string };
    try {
      payload = await this.jwt.verifyAsync(refreshToken, {
        secret: this.config.getOrThrow<string>('JWT_REFRESH_SECRET'),
      });
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const tokenHash = hashToken(refreshToken);
    const session = await this.sessions.findOne({ tokenHash, revoked: false }).exec();
    if (!session || session.expiresAt.getTime() < Date.now()) {
      throw new UnauthorizedException('Refresh token expired');
    }

    session.revoked = true;
    await session.save();

    const user = await this.users.findById(payload.sub);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return this.issueTokens(String(user._id), user.email, user.name);
  }

  async forgotPassword(email: string) {
    const user = await this.users.findByEmail(email);
    if (!user) {
      return { sent: true };
    }
    const token = randomToken(24);
    user.passwordResetTokenHash = hashToken(token);
    user.passwordResetExpiresAt = new Date(Date.now() + 60 * 60 * 1000);
    await user.save();

    const isDev = this.config.get('NODE_ENV') !== 'production';
    if (isDev) {
      this.logger.log(`Password reset token for ${email}: ${token}`);
    }
    return isDev ? { sent: true, token } : { sent: true };
  }

  async resetPassword(email: string, token: string, password: string) {
    const user = await this.users.findByEmail(email);
    if (
      !user ||
      !user.passwordResetTokenHash ||
      !user.passwordResetExpiresAt ||
      user.passwordResetExpiresAt.getTime() < Date.now() ||
      user.passwordResetTokenHash !== hashToken(token)
    ) {
      throw new UnauthorizedException('Reset link is invalid or expired');
    }

    user.passwordHash = await bcrypt.hash(password, 12);
    user.passwordResetTokenHash = undefined;
    user.passwordResetExpiresAt = undefined;
    await user.save();
    await this.sessions.updateMany({ userId: user._id }, { $set: { revoked: true } }).exec();
    return { reset: true };
  }

  private async issueTokens(userId: string, email: string, name: string) {
    const accessToken = await this.jwt.signAsync(
      { sub: userId, email },
      {
        secret: this.config.getOrThrow<string>('JWT_ACCESS_SECRET'),
        expiresIn: this.config.get('JWT_ACCESS_EXPIRES', '15m') as `${number}m` | `${number}d`,
      },
    );
    const refreshToken = await this.jwt.signAsync(
      { sub: userId, email },
      {
        secret: this.config.getOrThrow<string>('JWT_REFRESH_SECRET'),
        expiresIn: this.config.get('JWT_REFRESH_EXPIRES', '30d') as `${number}m` | `${number}d`,
      },
    );

    await this.sessions.create({
      userId,
      tokenHash: hashToken(refreshToken),
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      revoked: false,
    });

    return {
      accessToken,
      refreshToken,
      user: { id: userId, email, name },
    };
  }
}
