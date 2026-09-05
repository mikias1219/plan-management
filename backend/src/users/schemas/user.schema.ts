import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

@Schema({ _id: false })
class GoogleAccount {
  @Prop()
  email?: string;

  @Prop({ default: false })
  connected: boolean;

  @Prop()
  scope?: string;
}

@Schema({ timestamps: true, collection: 'users' })
export class User {
  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  email: string;

  @Prop({ required: true })
  passwordHash: string;

  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ default: 'UTC' })
  timezone: string;

  @Prop({ type: GoogleAccount, default: () => ({ connected: false }) })
  googleAccount: GoogleAccount;

  @Prop()
  passwordResetTokenHash?: string;

  @Prop()
  passwordResetExpiresAt?: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
