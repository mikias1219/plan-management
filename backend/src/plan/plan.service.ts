import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { endOfMonth, endOfWeek, startOfMonth, startOfWeek, toDateString } from '../common/utils/dates.js';
import { ownedBy } from '../common/utils/oid.js';
import { serializeMany } from '../common/utils/serialize.js';
import { Activity, ActivityDocument } from '../activities/schemas/activity.schema.js';
import { Goal, GoalDocument } from '../goals/schemas/goal.schema.js';
import { PersonalYearsService } from '../personal-years/personal-years.service.js';
import { Task, TaskDocument } from '../tasks/schemas/task.schema.js';
import { TodayService } from '../today/today.service.js';

@Injectable()
export class PlanService {
  constructor(
    private readonly today: TodayService,
    private readonly years: PersonalYearsService,
    @InjectModel(Activity.name) private readonly activities: Model<ActivityDocument>,
    @InjectModel(Task.name) private readonly tasks: Model<TaskDocument>,
    @InjectModel(Goal.name) private readonly goals: Model<GoalDocument>,
  ) {}

  async get(userId: string, view: 'day' | 'week' | 'month' | 'year', dateParam?: string) {
    const date = (dateParam ?? toDateString(new Date())).slice(0, 10);
    if (view === 'day') {
      return { view, ...(await this.today.getToday(userId, date)) };
    }

    const range =
      view === 'week'
        ? { from: startOfWeek(date), to: endOfWeek(date) }
        : view === 'month'
          ? { from: startOfMonth(date), to: endOfMonth(date) }
          : await this.yearRange(userId, date);

    const owner = ownedBy(userId);
    const [activities, tasks, goals] = await Promise.all([
      this.activities.find({ userId: owner, date: { $gte: range.from, $lte: range.to } }).sort({ date: 1 }).exec(),
      this.tasks.find({ userId: owner }).sort({ dueDate: 1 }).exec(),
      this.goals.find({ userId: owner }).sort({ createdAt: -1 }).exec(),
    ]);

    const periodTasks = tasks.filter((task) => !task.dueDate || (task.dueDate >= range.from && task.dueDate <= range.to));

    return {
      view,
      date,
      from: range.from,
      to: range.to,
      personalYear: await this.years.getActive(userId, date),
      activities: serializeMany(activities),
      tasks: serializeMany(periodTasks),
      goals: serializeMany(goals),
    };
  }

  private async yearRange(userId: string, date: string) {
    const year = await this.years.getActive(userId, date);
    if (year) {
      return { from: year.startDate, to: year.endDate };
    }
    return { from: `${date.slice(0, 4)}-01-01`, to: `${date.slice(0, 4)}-12-31` };
  }
}
