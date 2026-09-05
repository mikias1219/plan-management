import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, SchemaTypes, Types } from 'mongoose';
import type { ReviewType } from '../../common/enums.js';

export type ReviewDocument = HydratedDocument<Review>;

@Schema({ timestamps: true, collection: 'reviews' })
export class Review {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  userId: Types.ObjectId;

  @Prop({ required: true, enum: ['weekly', 'monthly', 'yearly'] })
  type: ReviewType;

  @Prop({ required: true })
  periodStart: string;

  @Prop({ required: true })
  periodEnd: string;

  @Prop({ type: SchemaTypes.Mixed, default: {} })
  autoSummary: Record<string, unknown>;

  @Prop({ default: '' })
  wentWell: string;

  @Prop({ default: '' })
  shouldImprove: string;
}

export const ReviewSchema = SchemaFactory.createForClass(Review);
ReviewSchema.index({ userId: 1, type: 1, periodStart: 1 }, { unique: true });
