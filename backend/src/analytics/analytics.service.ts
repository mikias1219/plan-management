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

    const openTasks = tasks.filter((task) => task.status !== 'completed' && task.status !== 'cancelled');
    const overdueTasks = openTasks.filter((task) => task.dueDate && task.dueDate < date);
    const taskCompletion =
      tasks.length === 0
        ? 0
        : Math.round((tasks.filter((task) => task.status === 'completed').length / tasks.length) * 100);
    const goalProgress =
      goals.length === 0 ? 0 : Math.round(goals.reduce((sum, goal) => sum + goal.progress, 0) / goals.length);
    const monthSummary = month.autoSummary as {
      habitsCompleted?: number;
      habitsMissed?: number;
      knowledgeCreated?: number;
    };
    const wins = monthSummary.habitsCompleted ?? 0;
    const misses = monthSummary.habitsMissed ?? 0;
    const doingWell = neglected.slice(-1)[0]?.name ?? null;
    const neglecting = neglected[0]?.name ?? null;

    const insights: Array<{
      id: string;
      tone: 'info' | 'success' | 'warning' | 'danger';
      title: string;
      body: string;
      action?: string;
    }> = [];

    if (overdueTasks.length > 0) {
      insights.push({
        id: 'overdue-tasks',
        tone: 'danger',
        title: `${overdueTasks.length} overdue task${overdueTasks.length === 1 ? '' : 's'}`,
        body: 'Clear them today so your plan stays honest.',
        action: 'Tasks',
      });
    }
    if (openTasks.length > 0 && overdueTasks.length === 0) {
      insights.push({
        id: 'open-tasks',
        tone: 'info',
        title: `${openTasks.length} open task${openTasks.length === 1 ? '' : 's'}`,
        body: 'Keep momentum — finish one next.',
        action: 'Tasks',
      });
    }
    if (wins > 0) {
      insights.push({
        id: 'month-wins',
        tone: 'success',
        title: `${wins} win${wins === 1 ? '' : 's'} this month`,
        body: misses > 0 ? `${misses} missed — progress is still real.` : 'Strong consistency so far.',
        action: 'TodayTab',
      });
    }
    if (doingWell) {
      insights.push({
        id: 'doing-well',
        tone: 'success',
        title: `${doingWell} is going well`,
        body: 'You are putting the most time here this month.',
        action: 'PlanTab',
      });
    }
    if (neglecting && neglecting !== doingWell) {
      insights.push({
        id: 'needs-attention',
        tone: 'warning',
        title: `${neglecting} needs attention`,
        body: 'Little time logged here this month.',
        action: 'PlanTab',
      });
    }

    return {
      weeklyCompletion: week.autoSummary,
      monthlyCompletion: month.autoSummary,
      heatmap,
      timeDistribution: Object.entries(timeByArea).map(([id, minutes]) => ({
        lifeAreaId: id,
        name: areaName.get(id) ?? 'Unknown',
        minutes,
      })),
      doingWell,
      neglecting,
      taskCompletion,
      goalProgress,
      activeHabits: habits.length,
      openTasks: openTasks.length,
      overdueTasks: overdueTasks.length,
      goalsCount: goals.length,
      insights,
    };
  }
}
