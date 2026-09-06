import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  endOfMonth,
  endOfWeek,
  startOfMonth,
  startOfWeek,
  toDateString,
} from '../common/utils/dates.js';
import { oid, ownedBy } from '../common/utils/oid.js';
import { serialize } from '../common/utils/serialize.js';
import { Achievement, AchievementDocument } from '../achievements/schemas/achievement.schema.js';
import { DayItem, DayItemDocument } from '../day-items/schemas/day-item.schema.js';
import { Goal, GoalDocument } from '../goals/schemas/goal.schema.js';
import { Knowledge, KnowledgeDocument } from '../knowledge/schemas/knowledge.schema.js';
import { PersonalYearsService } from '../personal-years/personal-years.service.js';
import { Review, ReviewDocument } from './schemas/review.schema.js';
import { Task, TaskDocument } from '../tasks/schemas/task.schema.js';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectModel(Review.name) private readonly reviews: Model<ReviewDocument>,
    @InjectModel(DayItem.name) private readonly dayItems: Model<DayItemDocument>,
    @InjectModel(Task.name) private readonly tasks: Model<TaskDocument>,
    @InjectModel(Goal.name) private readonly goals: Model<GoalDocument>,
    @InjectModel(Knowledge.name) private readonly knowledge: Model<KnowledgeDocument>,
    @InjectModel(Achievement.name) private readonly achievements: Model<AchievementDocument>,
    private readonly years: PersonalYearsService,
  ) {}

  async getPeriod(
    userId: string,
    type: 'weekly' | 'monthly' | 'yearly',
    date = toDateString(new Date()),
  ) {
    const { periodStart, periodEnd } = await this.bounds(userId, type, date);
    const summary = await this.computeSummary(userId, periodStart, periodEnd);
    const existing = await this.reviews.findOne({ userId: ownedBy(userId), type, periodStart }).exec();
    return {
      type,
      periodStart,
      periodEnd,
      autoSummary: summary,
      reflection: existing
        ? { wentWell: existing.wentWell, shouldImprove: existing.shouldImprove, id: String(existing._id) }
        : null,
    };
  }

  async saveReflection(
    userId: string,
    type: 'weekly' | 'monthly' | 'yearly',
    date: string,
    wentWell: string,
    shouldImprove: string,
  ) {
    const { periodStart, periodEnd } = await this.bounds(userId, type, date);
    const autoSummary = await this.computeSummary(userId, periodStart, periodEnd);
    const saved = await this.reviews
      .findOneAndUpdate(
        { userId: ownedBy(userId), type, periodStart },
        { $set: { userId: oid(userId), type, periodStart, periodEnd, autoSummary, wentWell, shouldImprove } },
        { new: true, upsert: true },
      )
      .exec();
    return serialize(saved!);
  }

  private async bounds(userId: string, type: 'weekly' | 'monthly' | 'yearly', date: string) {
    if (type === 'weekly') {
      return { periodStart: startOfWeek(date), periodEnd: endOfWeek(date) };
    }
    if (type === 'monthly') {
      return { periodStart: startOfMonth(date), periodEnd: endOfMonth(date) };
    }
    const year = await this.years.getActive(userId, date);
    if (year) {
      return { periodStart: year.startDate, periodEnd: year.endDate };
    }
    return { periodStart: `${date.slice(0, 4)}-01-01`, periodEnd: `${date.slice(0, 4)}-12-31` };
  }

  async computeSummary(userId: string, from: string, to: string) {
    const owner = ownedBy(userId);
    const [items, tasks, goals, knowledge, achievements] = await Promise.all([
      this.dayItems.find({ userId: owner, date: { $gte: from, $lte: to } }).exec(),
      this.tasks.find({ userId: owner }).exec(),
      this.goals.find({ userId: owner }).exec(),
      this.knowledge
        .find({ userId: owner, createdAt: { $gte: new Date(from), $lte: new Date(`${to}T23:59:59Z`) } })
        .exec(),
      this.achievements.find({ userId: owner, date: { $gte: from, $lte: to } }).exec(),
    ]);

    const done = items.filter((item) => item.status === 'done');
    const missed = items.filter((item) => item.status === 'missed');
    const planned = items.filter((item) => item.status === 'planned');
    const minutesByTitle: Record<string, number> = {};
    for (const item of done) {
      if (item.unit === 'minutes') {
        minutesByTitle[item.title] = (minutesByTitle[item.title] ?? 0) + item.target;
      }
    }

    const timeDistribution = Object.entries(minutesByTitle)
      .map(([name, minutes]) => ({ lifeAreaId: name, name, minutes }))
      .sort((a, b) => b.minutes - a.minutes);

    return {
      habitsCompleted: done.length,
      habitsMissed: missed.length,
      itemsPlanned: planned.length,
      itemsTotal: items.length,
      dueHabitsSample: items.length,
      tasksCompleted: tasks.filter((task) => task.status === 'completed').length,
      goalsInProgress: goals.filter((goal) => goal.status === 'in_progress').length,
      goalsCompleted: goals.filter((goal) => goal.status === 'completed').length,
      timeSpentByArea: timeDistribution,
      activitiesCompleted: done.length,
      knowledgeCreated: knowledge.length,
      achievements: achievements.map((item) => ({ id: String(item._id), title: item.title, date: item.date })),
      strongestArea: timeDistribution[0]?.name ?? null,
      weakestArea: timeDistribution.length ? timeDistribution[timeDistribution.length - 1].name : null,
    };
  }
}
