import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  endOfMonth,
  endOfWeek,
  isHabitDueOnDate,
  startOfMonth,
  startOfWeek,
  toDateString,
} from '../common/utils/dates.js';
import { oid, ownedBy } from '../common/utils/oid.js';
import { serialize } from '../common/utils/serialize.js';
import { Achievement, AchievementDocument } from '../achievements/schemas/achievement.schema.js';
import { Activity, ActivityDocument } from '../activities/schemas/activity.schema.js';
import { Goal, GoalDocument } from '../goals/schemas/goal.schema.js';
import { Habit, HabitDocument } from '../habits/schemas/habit.schema.js';
import { Knowledge, KnowledgeDocument } from '../knowledge/schemas/knowledge.schema.js';
import { LifeArea, LifeAreaDocument } from '../life-areas/schemas/life-area.schema.js';
import { PersonalYearsService } from '../personal-years/personal-years.service.js';
import { Review, ReviewDocument } from './schemas/review.schema.js';
import { Task, TaskDocument } from '../tasks/schemas/task.schema.js';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectModel(Review.name) private readonly reviews: Model<ReviewDocument>,
    @InjectModel(Activity.name) private readonly activities: Model<ActivityDocument>,
    @InjectModel(Habit.name) private readonly habits: Model<HabitDocument>,
    @InjectModel(Task.name) private readonly tasks: Model<TaskDocument>,
    @InjectModel(Goal.name) private readonly goals: Model<GoalDocument>,
    @InjectModel(Knowledge.name) private readonly knowledge: Model<KnowledgeDocument>,
    @InjectModel(Achievement.name) private readonly achievements: Model<AchievementDocument>,
    @InjectModel(LifeArea.name) private readonly areas: Model<LifeAreaDocument>,
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
    const [activities, habits, tasks, goals, knowledge, achievements, areas] = await Promise.all([
      this.activities.find({ userId: owner, date: { $gte: from, $lte: to } }).exec(),
      this.habits.find({ userId: owner, active: true }).exec(),
      this.tasks.find({ userId: owner }).exec(),
      this.goals.find({ userId: owner }).exec(),
      this.knowledge.find({ userId: owner, createdAt: { $gte: new Date(from), $lte: new Date(`${to}T23:59:59Z`) } }).exec(),
      this.achievements.find({ userId: owner, date: { $gte: from, $lte: to } }).exec(),
      this.areas.find({ userId: owner }).exec(),
    ]);

    const completedActivities = activities.filter((item) => item.status === 'completed' || item.status === 'partial');
    const missed = activities.filter((item) => item.status === 'missed');
    const timeByArea: Record<string, number> = {};
    for (const item of activities) {
      const key = String(item.lifeAreaId);
      timeByArea[key] = (timeByArea[key] ?? 0) + (item.durationMinutes || 0);
    }

    const areaName = new Map(areas.map((area) => [String(area._id), area.name]));
    const timeDistribution = Object.entries(timeByArea)
      .map(([id, minutes]) => ({ lifeAreaId: id, name: areaName.get(id) ?? 'Unknown', minutes }))
      .sort((a, b) => b.minutes - a.minutes);

    const strongest = timeDistribution[0]?.name ?? null;
    const weakest = timeDistribution.length ? timeDistribution[timeDistribution.length - 1].name : null;

    const dueCount = habits.filter((habit) =>
      isHabitDueOnDate({ frequency: habit.frequency, selectedDays: habit.selectedDays, date: from }),
    ).length;

    return {
      habitsCompleted: completedActivities.length,
      habitsMissed: missed.length,
      dueHabitsSample: dueCount,
      tasksCompleted: tasks.filter((task) => task.status === 'completed').length,
      goalsInProgress: goals.filter((goal) => goal.status === 'in_progress').length,
      goalsCompleted: goals.filter((goal) => goal.status === 'completed').length,
      timeSpentByArea: timeDistribution,
      activitiesCompleted: completedActivities.length,
      knowledgeCreated: knowledge.length,
      achievements: achievements.map((item) => ({ id: String(item._id), title: item.title, date: item.date })),
      strongestArea: strongest,
      weakestArea: weakest,
    };
  }
}
