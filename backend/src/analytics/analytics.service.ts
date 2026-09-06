import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { endOfMonth, startOfMonth, toDateString } from '../common/utils/dates.js';
import { ownedBy } from '../common/utils/oid.js';
import { DayItem, DayItemDocument } from '../day-items/schemas/day-item.schema.js';
import { Goal, GoalDocument } from '../goals/schemas/goal.schema.js';
import { ReviewsService } from '../reviews/reviews.service.js';
import { Task, TaskDocument } from '../tasks/schemas/task.schema.js';

@Injectable()
export class AnalyticsService {
  constructor(
    private readonly reviews: ReviewsService,
    @InjectModel(DayItem.name) private readonly dayItems: Model<DayItemDocument>,
    @InjectModel(Task.name) private readonly tasks: Model<TaskDocument>,
    @InjectModel(Goal.name) private readonly goals: Model<GoalDocument>,
  ) {}

  async dashboard(userId: string, date = toDateString(new Date())) {
    const owner = ownedBy(userId);
    const week = await this.reviews.getPeriod(userId, 'weekly', date);
    const month = await this.reviews.getPeriod(userId, 'monthly', date);
    const monthStart = startOfMonth(date);
    const monthEnd = endOfMonth(date);

    const monthItems = await this.dayItems
      .find({ userId: owner, date: { $gte: monthStart, $lte: monthEnd } })
      .exec();

    const heatmap: Record<string, number> = {};
    for (const item of monthItems) {
      heatmap[item.date] = (heatmap[item.date] ?? 0) + 1;
    }

    const minutesByTitle: Record<string, number> = {};
    for (const item of monthItems.filter((row) => row.status === 'done' && row.unit === 'minutes')) {
      minutesByTitle[item.title] = (minutesByTitle[item.title] ?? 0) + item.target;
    }
    const timeDistribution = Object.entries(minutesByTitle)
      .map(([name, minutes]) => ({ lifeAreaId: name, name, minutes }))
      .sort((a, b) => b.minutes - a.minutes);

    const tasks = await this.tasks.find({ userId: owner }).exec();
    const goals = await this.goals.find({ userId: owner }).exec();

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
    const doingWell = timeDistribution[0]?.name ?? null;
    const neglecting = timeDistribution.length > 1 ? timeDistribution[timeDistribution.length - 1].name : null;

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
        title: `${wins} plan item${wins === 1 ? '' : 's'} done this month`,
        body: misses > 0 ? `${misses} missed — progress is still real.` : 'Strong consistency so far.',
        action: 'TodayTab',
      });
    }
    if (doingWell) {
      insights.push({
        id: 'doing-well',
        tone: 'success',
        title: `${doingWell} is going well`,
        body: 'Most finished minutes are here this month.',
        action: 'PlanTab',
      });
    }
    if (neglecting && neglecting !== doingWell) {
      insights.push({
        id: 'needs-attention',
        tone: 'warning',
        title: `${neglecting} needs attention`,
        body: 'Fewer finished minutes here this month.',
        action: 'PlanTab',
      });
    }

    return {
      weeklyCompletion: week.autoSummary,
      monthlyCompletion: month.autoSummary,
      heatmap,
      timeDistribution,
      doingWell,
      neglecting,
      taskCompletion,
      goalProgress,
      activeHabits: monthItems.filter((item) => item.status === 'planned').length,
      openTasks: openTasks.length,
      overdueTasks: overdueTasks.length,
      goalsCount: goals.length,
      insights,
    };
  }
}
