import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { serialize } from '../common/utils/serialize.js';
import { User, UserDocument } from './schemas/user.schema.js';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private readonly users: Model<UserDocument>) {}

  findByEmail(email: string) {
    return this.users.findOne({ email: email.toLowerCase() }).exec();
  }

  findById(id: string) {
    return this.users.findById(id).exec();
  }

  create(data: Partial<User>) {
    return this.users.create(data);
  }

  async getProfile(userId: string) {
    const user = await this.users.findById(userId).exec();
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const json = serialize(user);
    delete (json as { passwordHash?: string }).passwordHash;
    delete (json as { passwordResetTokenHash?: string }).passwordResetTokenHash;
    return json;
  }

  async updateProfile(userId: string, patch: { name?: string; timezone?: string }) {
    const user = await this.users
      .findByIdAndUpdate(userId, { $set: patch }, { new: true })
      .exec();
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const json = serialize(user);
    delete (json as { passwordHash?: string }).passwordHash;
    return json;
  }

  async setGoogleAccount(userId: string, email: string, scope: string) {
    await this.users
      .findByIdAndUpdate(userId, {
        $set: { googleAccount: { email, connected: true, scope } },
      })
      .exec();
  }

  async clearGoogleAccount(userId: string) {
    await this.users
      .findByIdAndUpdate(userId, {
        $set: { googleAccount: { connected: false } },
      })
      .exec();
  }

  objectId(userId: string) {
    return new Types.ObjectId(userId);
  }
}
