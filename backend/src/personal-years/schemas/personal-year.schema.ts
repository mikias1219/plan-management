import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type PersonalYearDocument = HydratedDocument<PersonalYear>;

@Schema({ timestamps: true, collection: 'personal_years' })
export class PersonalYear {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  userId: Types.ObjectId;

  @Prop({ required: true })
  startDate: string;

  @Prop({ required: true })
  endDate: string;

  @Prop({ default: true })
  active: boolean;
}

export const PersonalYearSchema = SchemaFactory.createForClass(PersonalYear);
PersonalYearSchema.index({ userId: 1, active: 1 });
