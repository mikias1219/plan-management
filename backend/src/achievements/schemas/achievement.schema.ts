import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type AchievementDocument = HydratedDocument<Achievement>;

@Schema({ timestamps: true, collection: 'achievements' })
export class Achievement {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  userId: Types.ObjectId;

  @Prop({ required: true, trim: true })
  title: string;

  @Prop({ default: '' })
  description: string;

  @Prop({ required: true })
  date: string;

  @Prop({ type: Types.ObjectId, ref: 'LifeArea' })
  lifeAreaId?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Goal' })
  goalId?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Activity' })
  activityId?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'DocumentRecord' })
  documentId?: Types.ObjectId;
}

export const AchievementSchema = SchemaFactory.createForClass(Achievement);
AchievementSchema.index({ userId: 1, date: -1 });
AchievementSchema.index({ title: 'text', description: 'text' });
