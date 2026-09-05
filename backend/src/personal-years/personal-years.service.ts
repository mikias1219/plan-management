import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { addUtcDays, calculatePersonalYearProgress, toDateString } from '../common/utils/dates.js';
import { oid, ownedBy } from '../common/utils/oid.js';
import { serialize, serializeMany } from '../common/utils/serialize.js';
import { CreatePersonalYearDto } from './dto/personal-year.dto.js';
import { PersonalYear, PersonalYearDocument } from './schemas/personal-year.schema.js';

@Injectable()
export class PersonalYearsService {
  constructor(
    @InjectModel(PersonalYear.name) private readonly years: Model<PersonalYearDocument>,
  ) {}

  async list(userId: string) {
    const rows = await this.years.find({ userId: ownedBy(userId) }).sort({ startDate: -1 }).exec();
    return serializeMany(rows).map((year) => this.withProgress(year));
  }

  async getActive(userId: string, today = toDateString(new Date())) {
    const year = await this.years.findOne({ userId: ownedBy(userId), active: true }).exec();
    if (!year) {
      return null;
    }
    return this.withProgress(serialize(year), today);
  }

  async create(userId: string, dto: CreatePersonalYearDto) {
    const startDate = dto.startDate.slice(0, 10);
    const endDate = (dto.endDate ?? addUtcDays(startDate, 364)).slice(0, 10);
    if (endDate <= startDate) {
      throw new BadRequestException('End date must be after start date');
    }

    await this.years.updateMany({ userId: ownedBy(userId), active: true }, { $set: { active: false } }).exec();
    const created = await this.years.create({ userId: oid(userId), startDate, endDate, active: true });
    return this.withProgress(serialize(created));
  }

  async findOne(userId: string, id: string) {
    const year = await this.years.findOne({ _id: id, userId: ownedBy(userId) }).exec();
    if (!year) {
      throw new NotFoundException('Personal year not found');
    }
    return this.withProgress(serialize(year));
  }

  private withProgress<T extends { startDate: string; endDate: string }>(
    year: T,
    today = toDateString(new Date()),
  ) {
    return { ...year, ...calculatePersonalYearProgress(year.startDate, year.endDate, today) };
  }
}
