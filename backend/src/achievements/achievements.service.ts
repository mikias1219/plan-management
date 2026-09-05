import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { oid, ownedBy } from '../common/utils/oid.js';
import { serialize, serializeMany } from '../common/utils/serialize.js';
import { CreateAchievementDto } from './dto/achievement.dto.js';
import { Achievement, AchievementDocument } from './schemas/achievement.schema.js';

@Injectable()
export class AchievementsService {
  constructor(@InjectModel(Achievement.name) private readonly items: Model<AchievementDocument>) {}

  async list(userId: string) {
    const rows = await this.items.find({ userId: ownedBy(userId) }).sort({ date: -1 }).exec();
    return serializeMany(rows);
  }

  async create(userId: string, dto: CreateAchievementDto) {
    const created = await this.items.create({ ...dto, userId: oid(userId), date: dto.date.slice(0, 10) });
    return serialize(created);
  }

  async findOne(userId: string, id: string) {
    const item = await this.items.findOne({ _id: id, userId: ownedBy(userId) }).exec();
    if (!item) {
      throw new NotFoundException('Achievement not found');
    }
    return serialize(item);
  }

  async remove(userId: string, id: string) {
    const result = await this.items.findOneAndDelete({ _id: id, userId: ownedBy(userId) }).exec();
    if (!result) {
      throw new NotFoundException('Achievement not found');
    }
    return { deleted: true };
  }
}
