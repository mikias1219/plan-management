import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type JournalEntryDocument = HydratedDocument<JournalEntry>;

@Schema({ timestamps: true, collection: 'journal_entries' })
export class JournalEntry {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ required: true })
  date: string;

  @Prop({ default: '' })
  wentWell: string;

  @Prop({ default: '' })
  accomplished: string;

  @Prop({ default: '' })
  failedToComplete: string;

  @Prop({ default: '' })
  learned: string;

  @Prop({ default: '' })
  improveTomorrow: string;

  @Prop({ type: Types.ObjectId, ref: 'DocumentRecord' })
  documentId?: Types.ObjectId;
}

export const JournalEntrySchema = SchemaFactory.createForClass(JournalEntry);
JournalEntrySchema.index({ userId: 1, date: 1 }, { unique: true });
