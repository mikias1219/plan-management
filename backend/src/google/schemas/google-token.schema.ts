import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type GoogleTokenDocument = HydratedDocument<GoogleToken>;

@Schema({ timestamps: true, collection: 'google_tokens' })
export class GoogleToken {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, unique: true })
  userId: Types.ObjectId;

  @Prop({ required: true })
  encryptedRefreshToken: string;

  @Prop()
  encryptedAccessToken?: string;

  @Prop()
  accessTokenExpiresAt?: Date;

  @Prop()
  scope?: string;
}

export const GoogleTokenSchema = SchemaFactory.createForClass(GoogleToken);
