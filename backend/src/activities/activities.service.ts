import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { oid, ownedBy } from '../common/utils/oid.js';
import { serialize, serializeMany } from '../common/utils/serialize.js';
import { Goal, GoalDocument } from '../goals/schemas/goal.schema.js';
import { CreateActivityDto, UpdateActivityDto } from './dto/activity.dto.js';
import { Activity, ActivityDocument } from './schemas/activity.schema.js';

@Injectable()
export class ActivitiesService {
  constructor(
    @InjectModel(Activity.name) private readonly activities: Model<ActivityDocument>,
    @InjectModel(Goal.name) private readonly goals: Model<GoalDocument>,
  ) {}

  async list(userId: string, query: { date?: string; habitId?: string; from?: string; to?: string }) {
    const filter: Record<string, unknown> = { userId: ownedBy(userId) };
    if (query.date) {
      filter.date = query.date.slice(0, 10);
    }
    if (query.habitId) {
      filter.habitId = query.habitId;
    }
    if (query.from || query.to) {
      filter.date = {
        ...(query.from ? { $gte: query.from.slice(0, 10) } : {}),
        ...(query.to ? { $lte: query.to.slice(0, 10) } : {}),
      };
    }
    const rows = await this.activities.find(filter).sort({ createdAt: -1 }).exec();
    return serializeMany(rows);
  }

  async create(userId: string, dto: CreateActivityDto) {
    if (dto.clientId) {
      const existing = await this.activities.findOne({ userId: ownedBy(userId), clientId: dto.clientId }).exec();
      if (existing) {
        return serialize(existing);
      }
    }

    const created = await this.activities.create({
      ...dto,
      userId: oid(userId),
      date: dto.date.slice(0, 10),
      durationMinutes: dto.durationMinutes ?? 0,
    });

    if (dto.relatedGoalId && dto.durationMinutes) {
      await this.bumpGoal(userId, dto.relatedGoalId, dto.durationMinutes);
    }

    return serialize(created);
  }

  async update(userId: string, id: string, dto: UpdateActivityDto) {
    const updated = await this.activities
      .findOneAndUpdate({ _id: id, userId: ownedBy(userId) }, { $set: dto }, { new: true })
      .exec();
    if (!updated) {
      throw new NotFoundException('Activity not found');
    }
    return serialize(updated);
  }

  async remove(userId: string, id: string) {
    const result = await this.activities.findOneAndDelete({ _id: id, userId: ownedBy(userId) }).exec();
    if (!result) {
      throw new NotFoundException('Activity not found');
    }
    return { deleted: true };
  }

  async markMissedIfNeeded(userId: string, habit: { _id: Types.ObjectId; lifeAreaId: Types.ObjectId; name: string }, date: string) {
    const existing = await this.activities
      .findOne({ userId: ownedBy(userId), habitId: habit._id, date, status: { $in: ['completed', 'partial', 'skipped', 'not_applicable', 'missed'] } })
      .exec();
    if (existing) {
      return serialize(existing);
    }
    const created = await this.activities.create({
      userId: oid(userId),
      habitId: habit._id,
      lifeAreaId: habit.lifeAreaId,
      date,
      title: `${habit.name} missed`,
      status: 'missed',
      durationMinutes: 0,
    });
    return serialize(created);
  }

  private async bumpGoal(userId: string, goalId: string, amount: number) {
    const goal = await this.goals.findOne({ _id: goalId, userId: ownedBy(userId) }).exec();
    if (!goal || !goal.target) {
      return;
    }
    goal.currentValue = Math.min(goal.target, goal.currentValue + amount);
    goal.progress = Math.min(100, Math.round((goal.currentValue / goal.target) * 100));
    if (goal.progress > 0 && goal.status === 'not_started') {
      goal.status = 'in_progress';
    }
    if (goal.progress >= 100) {
      goal.status = 'completed';
    }
    await goal.save();
  }
}
