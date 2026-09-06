import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { toDateString } from '../common/utils/dates.js';
import { oid, ownedBy } from '../common/utils/oid.js';
import { serialize, serializeMany } from '../common/utils/serialize.js';
import { CreateDayItemDto, DayItemQueryDto, UpdateDayItemDto } from './dto/day-item.dto.js';
import { DayItem, DayItemDocument } from './schemas/day-item.schema.js';

@Injectable()
export class DayItemsService {
  constructor(@InjectModel(DayItem.name) private readonly items: Model<DayItemDocument>) {}

  async list(userId: string, query: DayItemQueryDto = {}) {
    const filter: Record<string, unknown> = { userId: ownedBy(userId) };
    if (query.date) {
      filter.date = query.date.slice(0, 10);
    } else if (query.from && query.to) {
      filter.date = { $gte: query.from.slice(0, 10), $lte: query.to.slice(0, 10) };
    } else {
      filter.date = toDateString(new Date());
    }
    const rows = await this.items.find(filter).sort({ plannedTime: 1, createdAt: 1 }).exec();
    return serializeMany(rows);
  }

  async create(userId: string, dto: CreateDayItemDto) {
    const created = await this.items.create({
      userId: oid(userId),
      date: dto.date.slice(0, 10),
      title: dto.title.trim(),
      target: dto.target,
      unit: dto.unit ?? 'reps',
      plannedTime: dto.plannedTime,
      note: dto.note ?? '',
      status: 'planned',
    });
    return serialize(created);
  }

  async update(userId: string, id: string, dto: UpdateDayItemDto) {
    const updated = await this.items
      .findOneAndUpdate({ _id: id, userId: ownedBy(userId) }, { $set: dto }, { new: true })
      .exec();
    if (!updated) {
      throw new NotFoundException('Day item not found');
    }
    return serialize(updated);
  }

  async setStatus(userId: string, id: string, status: 'planned' | 'done' | 'missed') {
    return this.update(userId, id, { status });
  }

  async remove(userId: string, id: string) {
    const result = await this.items.findOneAndDelete({ _id: id, userId: ownedBy(userId) }).exec();
    if (!result) {
      throw new NotFoundException('Day item not found');
    }
    return { deleted: true };
  }

  async summaryForDate(userId: string, date: string) {
    const rows = await this.items.find({ userId: ownedBy(userId), date }).exec();
    const total = rows.length;
    const done = rows.filter((row) => row.status === 'done').length;
    const missed = rows.filter((row) => row.status === 'missed').length;
    const planned = rows.filter((row) => row.status === 'planned').length;
    const percent = total === 0 ? 0 : Math.round((done / total) * 100);
    return {
      total,
      done,
      missed,
      planned,
      percent,
      items: serializeMany(rows.sort((a, b) => String(a.plannedTime ?? '').localeCompare(String(b.plannedTime ?? '')))),
    };
  }
}
