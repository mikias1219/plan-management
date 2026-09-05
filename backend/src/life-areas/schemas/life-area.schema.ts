import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type LifeAreaDocument = HydratedDocument<LifeArea>;

@Schema({ timestamps: true, collection: 'life_areas' })
export class LifeArea {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  userId: Types.ObjectId;

  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ required: true, trim: true })
  slug: string;

  @Prop({ default: '#1C4E4A' })
  color: string;

  @Prop({ default: 'circle' })
  icon: string;

  @Prop({ default: 0 })
  sortOrder: number;

  @Prop({ default: false })
  isSystem: boolean;
}

export const LifeAreaSchema = SchemaFactory.createForClass(LifeArea);
LifeAreaSchema.index({ userId: 1, slug: 1 }, { unique: true });
