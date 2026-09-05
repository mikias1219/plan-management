import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { serialize, serializeMany } from '../common/utils/serialize.js';
import { oid, ownedBy } from '../common/utils/oid.js';
import { DEFAULT_LIFE_AREAS } from './defaults.js';
import { CreateLifeAreaDto, UpdateLifeAreaDto } from './dto/life-area.dto.js';
import { LifeArea, LifeAreaDocument } from './schemas/life-area.schema.js';

@Injectable()
export class LifeAreasService {
  constructor(@InjectModel(LifeArea.name) private readonly areas: Model<LifeAreaDocument>) {}

  async ensureDefaults(userId: string) {
    const uid = oid(userId);
    const count = await this.areas.countDocuments({ userId: ownedBy(userId) }).exec();
    if (count > 0) {
      return this.list(userId);
    }

    await this.areas.insertMany(
      DEFAULT_LIFE_AREAS.map((area) => ({
        userId: uid,
        ...area,
        isSystem: true,
      })),
    );
    return this.list(userId);
  }

  async list(userId: string) {
    const rows = await this.areas.find({ userId: ownedBy(userId) }).sort({ sortOrder: 1 }).exec();
    return serializeMany(rows);
  }

  async create(userId: string, dto: CreateLifeAreaDto) {
    const slug = dto.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    const existing = await this.areas.findOne({ userId: ownedBy(userId), slug }).exec();
    if (existing) {
      throw new ConflictException('A life area with this name already exists');
    }
    const last = await this.areas.findOne({ userId: ownedBy(userId) }).sort({ sortOrder: -1 }).exec();
    const created = await this.areas.create({
      userId: oid(userId),
      name: dto.name,
      slug,
      color: dto.color ?? '#1C4E4A',
      icon: dto.icon ?? 'circle',
      sortOrder: (last?.sortOrder ?? 0) + 1,
      isSystem: false,
    });
    return serialize(created);
  }

  async update(userId: string, id: string, dto: UpdateLifeAreaDto) {
    const updated = await this.areas
      .findOneAndUpdate({ _id: id, userId: ownedBy(userId) }, { $set: dto }, { new: true })
      .exec();
    if (!updated) {
      throw new NotFoundException('Life area not found');
    }
    return serialize(updated);
  }

  async findOwned(userId: string, id: string) {
    const area = await this.areas.findOne({ _id: id, userId: ownedBy(userId) }).exec();
    if (!area) {
      throw new NotFoundException('Life area not found');
    }
    return area;
  }
}
