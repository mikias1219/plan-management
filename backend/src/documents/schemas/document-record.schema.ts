import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import type { SyncStatus } from '../../common/enums.js';

export type DocumentRecordDocument = HydratedDocument<DocumentRecord>;

@Schema({ timestamps: true, collection: 'documents' })
export class DocumentRecord {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  userId: Types.ObjectId;

  @Prop({ required: true, trim: true })
  title: string;

  @Prop({ type: Types.ObjectId, ref: 'LifeArea' })
  lifeAreaId?: Types.ObjectId;

  @Prop({ default: '' })
  topic: string;

  @Prop()
  googleDocumentId?: string;

  @Prop()
  googleDriveFileId?: string;

  @Prop()
  webViewLink?: string;

  @Prop({ default: 'pending', enum: ['synced', 'pending', 'failed', 'conflict'] })
  syncStatus: SyncStatus;

  @Prop()
  lastSyncedAt?: Date;

  @Prop()
  lastError?: string;

  @Prop({ default: '' })
  localContent: string;
}

export const DocumentRecordSchema = SchemaFactory.createForClass(DocumentRecord);
DocumentRecordSchema.index({ userId: 1, lifeAreaId: 1 });
DocumentRecordSchema.index({ title: 'text', topic: 'text' });
