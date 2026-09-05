import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import type { ActivityStatus } from '../../common/enums.js';

export type ActivityDocument = HydratedDocument<Activity>;

@Schema({ timestamps: true, collection: 'activities' })
export class Activity {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  userId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Habit' })
  habitId?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'LifeArea', required: true })
  lifeAreaId: Types.ObjectId;

  @Prop({ required: true })
  date: string;

  @Prop({ required: true, trim: true })
  title: string;

  @Prop({ default: '' })
  description: string;

  @Prop()
  startTime?: string;

  @Prop()
  endTime?: string;

  @Prop({ default: 0 })
  durationMinutes: number;

  @Prop({
    required: true,
    enum: ['completed', 'partial', 'missed', 'skipped', 'not_applicable'],
  })
  status: ActivityStatus;

  @Prop({ default: '' })
  notes: string;

  @Prop({ type: Types.ObjectId, ref: 'Goal' })
  relatedGoalId?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Task' })
  relatedTaskId?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'DocumentRecord' })
  relatedDocumentId?: Types.ObjectId;

  @Prop()
  clientId?: string;
}

export const ActivitySchema = SchemaFactory.createForClass(Activity);
ActivitySchema.index({ userId: 1, date: 1 });
ActivitySchema.index({ userId: 1, habitId: 1, date: 1 });
ActivitySchema.index({ userId: 1, status: 1 });
ActivitySchema.index({ userId: 1, clientId: 1 }, { unique: true, sparse: true });
