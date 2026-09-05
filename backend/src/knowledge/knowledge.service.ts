import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { paginationMeta } from '../common/dto/pagination.dto.js';
import { oid, ownedBy } from '../common/utils/oid.js';
import { serialize, serializeMany } from '../common/utils/serialize.js';
import { CreateKnowledgeDto, UpdateKnowledgeDto } from './dto/knowledge.dto.js';
import { Knowledge, KnowledgeDocument } from './schemas/knowledge.schema.js';

@Injectable()
export class KnowledgeService {
  constructor(@InjectModel(Knowledge.name) private readonly notes: Model<KnowledgeDocument>) {}

  async list(userId: string, query: { lifeAreaId?: string; topic?: string; page?: number; limit?: number }) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const filter: Record<string, unknown> = { userId: ownedBy(userId) };
    if (query.lifeAreaId) {
      filter.lifeAreaId = query.lifeAreaId;
    }
    if (query.topic) {
      filter.topic = query.topic;
    }
    const [rows, total] = await Promise.all([
      this.notes
        .find(filter)
        .sort({ updatedAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .exec(),
      this.notes.countDocuments(filter).exec(),
    ]);
    return { data: serializeMany(rows), meta: paginationMeta(page, limit, total) };
  }

  async topics(userId: string, lifeAreaId?: string) {
    const match: Record<string, unknown> = { userId: ownedBy(userId) };
    if (lifeAreaId) {
      match.lifeAreaId = lifeAreaId;
    }
    return this.notes.aggregate([
      { $match: match },
      { $group: { _id: { topic: '$topic', lifeAreaId: '$lifeAreaId' }, count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);
  }

  async create(userId: string, dto: CreateKnowledgeDto) {
    const created = await this.notes.create({ ...dto, userId: oid(userId) });
    return serialize(created);
  }

  async findOne(userId: string, id: string) {
    const note = await this.notes.findOne({ _id: id, userId: ownedBy(userId) }).exec();
    if (!note) {
      throw new NotFoundException('Knowledge not found');
    }
    return serialize(note);
  }

  async update(userId: string, id: string, dto: UpdateKnowledgeDto) {
    const updated = await this.notes
      .findOneAndUpdate({ _id: id, userId: ownedBy(userId) }, { $set: dto }, { new: true })
      .exec();
    if (!updated) {
      throw new NotFoundException('Knowledge not found');
    }
    return serialize(updated);
  }

  async remove(userId: string, id: string) {
    const result = await this.notes.findOneAndDelete({ _id: id, userId: ownedBy(userId) }).exec();
    if (!result) {
      throw new NotFoundException('Knowledge not found');
    }
    return { deleted: true };
  }
}
