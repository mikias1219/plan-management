import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import type { TaskPriority, TaskStatus } from '../../common/enums.js';

export type TaskDocument = HydratedDocument<Task>;

@Schema({ timestamps: true, collection: 'tasks' })
export class Task {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  userId: Types.ObjectId;

  @Prop({ required: true, trim: true })
  title: string;

  @Prop({ default: '' })
  description: string;

  @Prop({ type: Types.ObjectId, ref: 'LifeArea' })
  lifeAreaId?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Goal' })
  goalId?: Types.ObjectId;

  @Prop()
  dueDate?: string;

  @Prop({ default: 'medium', enum: ['low', 'medium', 'high'] })
  priority: TaskPriority;

  @Prop({
    default: 'not_started',
    enum: ['not_started', 'in_progress', 'completed', 'cancelled', 'deferred'],
  })
  status: TaskStatus;

  @Prop({ default: 0 })
  estimatedDuration: number;

  @Prop({ default: 0 })
  actualDuration: number;
}

export const TaskSchema = SchemaFactory.createForClass(Task);
TaskSchema.index({ userId: 1, status: 1 });
TaskSchema.index({ userId: 1, lifeAreaId: 1 });
TaskSchema.index({ userId: 1, dueDate: 1 });
TaskSchema.index({ title: 'text', description: 'text' });
