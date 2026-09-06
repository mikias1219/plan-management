import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { toDateString } from '../common/utils/dates.js';
import { ownedBy } from '../common/utils/oid.js';
import { serializeMany } from '../common/utils/serialize.js';
import { DayItemsService } from '../day-items/day-items.service.js';
import { JournalEntry, JournalEntryDocument } from '../journal/schemas/journal-entry.schema.js';
import { PersonalYearsService } from '../personal-years/personal-years.service.js';
import { Task, TaskDocument } from '../tasks/schemas/task.schema.js';

@Injectable()
export class TodayService {
  constructor(
    private readonly years: PersonalYearsService,
    private readonly dayItems: DayItemsService,
    @InjectModel(Task.name) private readonly tasks: Model<TaskDocument>,
    @InjectModel(JournalEntry.name) private readonly journal: Model<JournalEntryDocument>,
  ) {}

  async getToday(userId: string, dateParam?: string) {
    const date = (dateParam ?? toDateString(new Date())).slice(0, 10);
    const personalYear = await this.years.getActive(userId, date);
    const plan = await this.dayItems.summaryForDate(userId, date);

    const openTasks = await this.tasks
      .find({
        userId: ownedBy(userId),
        status: { $in: ['not_started', 'in_progress'] },
        $or: [{ dueDate: { $lte: date } }, { dueDate: { $exists: false } }, { dueDate: null }],
      })
      .sort({ priority: -1, dueDate: 1 })
      .limit(10)
      .exec();

    const journal = await this.journal.findOne({ userId: ownedBy(userId), date }).exec();

    return {
      date,
      greeting: this.greeting(),
      personalYear,
      progress: {
        percent: plan.percent,
        completed: plan.done,
        total: plan.total,
        planned: plan.planned,
        missed: plan.missed,
      },
      items: plan.items,
      tasks: serializeMany(openTasks),
      journal: journal ? { id: String(journal._id), exists: true } : { exists: false },
    };
  }

  private greeting() {
    const hour = new Date().getHours();
    if (hour < 12) {
      return 'Good morning';
    }
    if (hour < 18) {
      return 'Good afternoon';
    }
    return 'Good evening';
  }
}
