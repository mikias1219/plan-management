import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { oid, ownedBy } from '../common/utils/oid.js';
import { serialize, serializeMany } from '../common/utils/serialize.js';
import { UpsertJournalDto } from './dto/journal.dto.js';
import { JournalEntry, JournalEntryDocument } from './schemas/journal-entry.schema.js';

@Injectable()
export class JournalService {
  constructor(@InjectModel(JournalEntry.name) private readonly entries: Model<JournalEntryDocument>) {}

  async list(userId: string) {
    const rows = await this.entries.find({ userId: ownedBy(userId) }).sort({ date: -1 }).limit(90).exec();
    return serializeMany(rows);
  }

  async getByDate(userId: string, date: string) {
    const entry = await this.entries.findOne({ userId: ownedBy(userId), date: date.slice(0, 10) }).exec();
    return entry ? serialize(entry) : null;
  }

  async upsert(userId: string, dto: UpsertJournalDto) {
    const date = dto.date.slice(0, 10);
    const entry = await this.entries
      .findOneAndUpdate(
        { userId: ownedBy(userId), date },
        { $set: { ...dto, date, userId: oid(userId) } },
        { new: true, upsert: true },
      )
      .exec();
    return serialize(entry!);
  }
}
