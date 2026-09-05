import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import type { CaptureStyle, HabitFrequency, HabitUnit } from '../../common/enums.js';

export type HabitDocument = HydratedDocument<Habit>;

@Schema({ timestamps: true, collection: 'habits' })
export class Habit {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  userId: Types.ObjectId;

  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ default: '' })
  description: string;

  @Prop({ type: Types.ObjectId, ref: 'LifeArea', required: true })
  lifeAreaId: Types.ObjectId;

  @Prop({ required: true, enum: ['daily', 'weekdays', 'weekly', 'monthly'] })
  frequency: HabitFrequency;

  @Prop({ type: [Number], default: [] })
  selectedDays: number[];

  @Prop({ required: true, default: 1 })
  target: number;

  @Prop({ required: true, enum: ['minutes', 'completion', 'count'] })
  unit: HabitUnit;

  @Prop()
  startDate?: string;

  @Prop()
  endDate?: string;

  @Prop({ default: true })
  active: boolean;

  @Prop({ default: '#1C4E4A' })
  color: string;

  @Prop({ default: 'circle' })
  icon: string;

  @Prop({ required: true, enum: ['complete', 'duration', 'learning'] })
  captureStyle: CaptureStyle;
}

export const HabitSchema = SchemaFactory.createForClass(Habit);
HabitSchema.index({ userId: 1, lifeAreaId: 1 });
HabitSchema.index({ userId: 1, active: 1 });
