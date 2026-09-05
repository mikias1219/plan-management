import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { endOfMonth, startOfMonth, toDateString } from '../common/utils/dates.js';
import { ownedBy } from '../common/utils/oid.js';
import { Activity, ActivityDocument } from '../activities/schemas/activity.schema.js';
import { Goal, GoalDocument } from '../goals/schemas/goal.schema.js';
import { Habit, HabitDocument } from '../habits/schemas/habit.schema.js';
import { LifeArea, LifeAreaDocument } from '../life-areas/schemas/life-area.schema.js';
import { ReviewsService } from '../reviews/reviews.service.js';
import { Task, TaskDocument } from '../tasks/schemas/task.schema.js';

@Injectable()
export class AnalyticsService {
  constructor(
    private readonly reviews: ReviewsService,
    @InjectModel(Activity.name) private readonly activities: Model<ActivityDocument>,
    @InjectModel(Habit.name) private readonly habits: Model<HabitDocument>,
    @InjectModel(Task.name) private readonly tasks: Model<TaskDocument>,
    @InjectModel(Goal.name) private readonly goals: Model<GoalDocument>,
    @InjectModel(LifeArea.name) private readonly areas: Model<LifeAreaDocument>,
  ) {}

  async dashboard(userId: string, date = toDateString(new Date())) {
    const owner = ownedBy(userId);
    const week = await this.reviews.getPeriod(userId, 'weekly', date);
    const month = await this.reviews.getPeriod(userId, 'monthly', date);
    const monthStart = startOfMonth(date);
    const monthEnd = endOfMonth(date);

    const monthActivities = await this.activities
      .find({ userId: owner, date: { $gte: monthStart, $lte: monthEnd } })
      .exec();

    const heatmap: Record<string, number> = {};
    for (const item of monthActivities) {
      heatmap[item.date] = (heatmap[item.date] ?? 0) + 1;
    }

    const areas = await this.areas.find({ userId: owner }).exec();
    const areaName = new Map(areas.map((area) => [String(area._id), area.name]));
    const timeByArea: Record<string, number> = {};
    for (const item of monthActivities) {
      const key = String(item.lifeAreaId);
      timeByArea[key] = (timeByArea[key] ?? 0) + (item.durationMinutes || 0);
    }

    const tasks = await this.tasks.find({ userId: owner }).exec();
    const goals = await this.goals.find({ userId: owner }).exec();
    const habits = await this.habits.find({ userId: owner, active: true }).exec();

    const neglected = areas
      .map((area) => ({
        name: area.name,
        minutes: timeByArea[String(area._id)] ?? 0,
      }))
      .sort((a, b) => a.minutes - b.minutes);

    return {
      weeklyCompletion: week.autoSummary,
      monthlyCompletion: month.autoSummary,
      heatmap,
      timeDistribution: Object.entries(timeByArea).map(([id, minutes]) => ({
        lifeAreaId: id,
        name: areaName.get(id) ?? 'Unknown',
        minutes,
      })),
      doingWell: neglected.slice(-1)[0]?.name ?? null,
      neglecting: neglected[0]?.name ?? null,
      taskCompletion:
        tasks.length === 0
          ? 0
          : Math.round((tasks.filter((task) => task.status === 'completed').length / tasks.length) * 100),
      goalProgress:
        goals.length === 0
          ? 0
          : Math.round(goals.reduce((sum, goal) => sum + goal.progress, 0) / goals.length),
      activeHabits: habits.length,
    };
  }
}
