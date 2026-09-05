import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import type { GoalPeriod, GoalStatus } from '../../common/enums.js';

export type GoalDocument = HydratedDocument<Goal>;

@Schema({ timestamps: true, collection: 'goals' })
export class Goal {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  userId: Types.ObjectId;

  @Prop({ required: true, trim: true })
  title: string;

  @Prop({ default: '' })
  description: string;

  @Prop({ type: Types.ObjectId, ref: 'LifeArea', required: true })
  lifeAreaId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Goal' })
  parentGoalId?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'PersonalYear' })
  personalYearId?: Types.ObjectId;

  @Prop({ required: true, enum: ['annual', 'quarterly', 'monthly', 'weekly'] })
  period: GoalPeriod;

  @Prop()
  startDate?: string;

  @Prop()
  endDate?: string;

  @Prop({ default: 0 })
  target: number;

  @Prop({ default: 0 })
  currentValue: number;

  @Prop({ default: 'count' })
  unit: string;

  @Prop({ default: 'not_started', enum: ['not_started', 'in_progress', 'completed', 'cancelled'] })
  status: GoalStatus;

  @Prop({ default: 0 })
  progress: number;
}

export const GoalSchema = SchemaFactory.createForClass(Goal);
GoalSchema.index({ userId: 1, lifeAreaId: 1 });
GoalSchema.index({ userId: 1, status: 1 });
GoalSchema.index({ title: 'text', description: 'text' });
