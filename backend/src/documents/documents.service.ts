import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { oid, ownedBy } from '../common/utils/oid.js';
import { serialize, serializeMany } from '../common/utils/serialize.js';
import { GoogleService } from '../google/google.service.js';
import { CreateDocumentDto, UpdateDocumentDto } from './dto/document.dto.js';
import { DocumentRecord, DocumentRecordDocument } from './schemas/document-record.schema.js';

@Injectable()
export class DocumentsService {
  constructor(
    @InjectModel(DocumentRecord.name) private readonly docs: Model<DocumentRecordDocument>,
    private readonly google: GoogleService,
  ) {}

  async list(userId: string, lifeAreaId?: string) {
    const filter: Record<string, unknown> = { userId: ownedBy(userId) };
    if (lifeAreaId) {
      filter.lifeAreaId = lifeAreaId;
    }
    const rows = await this.docs.find(filter).sort({ updatedAt: -1 }).exec();
    return serializeMany(rows);
  }

  async countsByArea(userId: string) {
    return this.docs.aggregate([
      { $match: { userId: ownedBy(userId) } },
      { $group: { _id: '$lifeAreaId', count: { $sum: 1 } } },
    ]);
  }

  async create(userId: string, dto: CreateDocumentDto) {
    let googleMeta: { googleDocumentId?: string; googleDriveFileId?: string; webViewLink?: string } = {};
    let syncStatus: 'synced' | 'pending' | 'failed' = 'pending';
    let lastError: string | undefined;

    try {
      if (dto.googleDocumentId) {
        googleMeta = {
          googleDocumentId: dto.googleDocumentId,
          googleDriveFileId: dto.googleDocumentId,
        };
        if (dto.content) {
          await this.google.writeDocument(userId, dto.googleDocumentId, dto.content);
        }
        syncStatus = 'synced';
      } else if (this.google.isConfigured() && (await this.google.isConnected(userId))) {
        const created = await this.google.createDocument(userId, dto.title, dto.content ?? '');
        googleMeta = {
          googleDocumentId: created.googleDocumentId,
          googleDriveFileId: created.googleDriveFileId,
          webViewLink: created.webViewLink,
        };
        syncStatus = 'synced';
      } else {
        syncStatus = 'pending';
      }
    } catch (error) {
      syncStatus = 'failed';
      lastError = error instanceof Error ? error.message : 'Could not sync this document.';
    }

    const created = await this.docs.create({
      userId: oid(userId),
      title: dto.title,
      lifeAreaId: dto.lifeAreaId,
      topic: dto.topic ?? '',
      localContent: dto.content ?? '',
      ...googleMeta,
      syncStatus,
      lastError,
      lastSyncedAt: syncStatus === 'synced' ? new Date() : undefined,
    });
    return serialize(created);
  }

  async findOne(userId: string, id: string) {
    const doc = await this.docs.findOne({ _id: id, userId: ownedBy(userId) }).exec();
    if (!doc) {
      throw new NotFoundException('Document not found');
    }
    return serialize(doc);
  }

  async update(userId: string, id: string, dto: UpdateDocumentDto) {
    const doc = await this.docs.findOne({ _id: id, userId: ownedBy(userId) }).exec();
    if (!doc) {
      throw new NotFoundException('Document not found');
    }
    if (dto.title) {
      doc.title = dto.title;
    }
    if (dto.topic != null) {
      doc.topic = dto.topic;
    }
    if (dto.localContent != null) {
      doc.localContent = dto.localContent;
      doc.syncStatus = 'pending';
    }
    await doc.save();
    if (dto.localContent != null && doc.googleDocumentId) {
      return this.retrySync(userId, id);
    }
    return serialize(doc);
  }

  async retrySync(userId: string, id: string) {
    const doc = await this.docs.findOne({ _id: id, userId: ownedBy(userId) }).exec();
    if (!doc) {
      throw new NotFoundException('Document not found');
    }
    try {
      if (!doc.googleDocumentId) {
        const created = await this.google.createDocument(userId, doc.title, doc.localContent);
        doc.googleDocumentId = created.googleDocumentId;
        doc.googleDriveFileId = created.googleDriveFileId;
        doc.webViewLink = created.webViewLink;
      } else {
        await this.google.writeDocument(userId, doc.googleDocumentId, doc.localContent);
      }
      doc.syncStatus = 'synced';
      doc.lastError = undefined;
      doc.lastSyncedAt = new Date();
    } catch (error) {
      doc.syncStatus = 'failed';
      doc.lastError = error instanceof Error ? error.message : "Couldn't sync this document. Retry.";
    }
    await doc.save();
    return serialize(doc);
  }
}
