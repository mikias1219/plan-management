import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersModule } from '../users/users.module.js';
import { GoogleController } from './google.controller.js';
import { GoogleService } from './google.service.js';
import { GoogleToken, GoogleTokenSchema } from './schemas/google-token.schema.js';

@Module({
  imports: [
    UsersModule,
    JwtModule.register({}),
    MongooseModule.forFeature([{ name: GoogleToken.name, schema: GoogleTokenSchema }]),
  ],
  controllers: [GoogleController],
  providers: [GoogleService],
  exports: [GoogleService],
})
export class GoogleModule {}
