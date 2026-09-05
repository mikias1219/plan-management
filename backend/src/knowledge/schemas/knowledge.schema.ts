import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type KnowledgeDocument = HydratedDocument<Knowledge>;

@Schema({ timestamps: true, collection: 'knowledge' })
export class Knowledge {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  userId: Types.ObjectId;

  @Prop({ required: true, trim: true })
  title: string;

  @Prop({ default: '' })
  content: string;

  @Prop({ default: '' })
  category: string;

  @Prop({ type: [String], default: [] })
  tags: string[];

  @Prop({ type: Types.ObjectId, ref: 'LifeArea', required: true })
  lifeAreaId: Types.ObjectId;

  @Prop({ default: '' })
  topic: string;

  @Prop({ type: Types.ObjectId, ref: 'Habit' })
  relatedHabitId?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Activity' })
  relatedActivityId?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Goal' })
  relatedGoalId?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'DocumentRecord' })
  documentId?: Types.ObjectId;
}

export const KnowledgeSchema = SchemaFactory.createForClass(Knowledge);
KnowledgeSchema.index({ userId: 1, lifeAreaId: 1 });
KnowledgeSchema.index({ title: 'text', content: 'text', tags: 'text', topic: 'text' });
