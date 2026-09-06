import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import type { DayItemStatus, DayItemUnit } from '../../common/enums.js';

export type DayItemDocument = HydratedDocument<DayItem>;

@Schema({ timestamps: true, collection: 'day_items' })
export class DayItem {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  userId: Types.ObjectId;

  @Prop({ required: true })
  date: string;

  @Prop({ required: true, trim: true })
  title: string;

  @Prop({ required: true, min: 1 })
  target: number;

  @Prop({ default: 'reps', enum: ['reps', 'minutes', 'count'] })
  unit: DayItemUnit;

  @Prop()
  plannedTime?: string;

  @Prop({ default: 'planned', enum: ['planned', 'done', 'missed'] })
  status: DayItemStatus;

  @Prop({ default: '' })
  note: string;
}

export const DayItemSchema = SchemaFactory.createForClass(DayItem);
DayItemSchema.index({ userId: 1, date: 1, status: 1 });
DayItemSchema.index({ userId: 1, date: 1, createdAt: 1 });
