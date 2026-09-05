import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, SchemaTypes, Types } from 'mongoose';

export type SyncJobDocument = HydratedDocument<SyncJob>;

@Schema({ timestamps: true, collection: 'sync_jobs' })
export class SyncJob {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  userId: Types.ObjectId;

  @Prop({ required: true })
  entityType: string;

  @Prop({ required: true })
  entityId: string;

  @Prop({ required: true })
  action: string;

  @Prop({ default: 'pending' })
  status: 'pending' | 'synced' | 'failed';

  @Prop({ default: 0 })
  attempts: number;

  @Prop()
  lastError?: string;

  @Prop({ type: SchemaTypes.Mixed, default: {} })
  payload: Record<string, unknown>;
}

export const SyncJobSchema = SchemaFactory.createForClass(SyncJob);
SyncJobSchema.index({ userId: 1, status: 1, createdAt: 1 });
