import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { oid, ownedBy } from '../common/utils/oid.js';
import { serialize, serializeMany } from '../common/utils/serialize.js';
import { CreateGoalDto, UpdateGoalDto } from './dto/goal.dto.js';
import { Goal, GoalDocument } from './schemas/goal.schema.js';

@Injectable()
export class GoalsService {
  constructor(@InjectModel(Goal.name) private readonly goals: Model<GoalDocument>) {}

  async list(userId: string, period?: string) {
    const filter: Record<string, unknown> = { userId: ownedBy(userId) };
    if (period) {
      filter.period = period;
    }
    const rows = await this.goals.find(filter).sort({ createdAt: -1 }).exec();
    return serializeMany(rows);
  }

  async create(userId: string, dto: CreateGoalDto) {
    const created = await this.goals.create({
      ...dto,
      userId: oid(userId),
      currentValue: 0,
      progress: 0,
      status: 'not_started',
    });
    return serialize(created);
  }

  async findOne(userId: string, id: string) {
    const goal = await this.goals.findOne({ _id: id, userId: ownedBy(userId) }).exec();
    if (!goal) {
      throw new NotFoundException('Goal not found');
    }
    return serialize(goal);
  }

  async update(userId: string, id: string, dto: UpdateGoalDto) {
    const goal = await this.goals.findOne({ _id: id, userId: ownedBy(userId) }).exec();
    if (!goal) {
      throw new NotFoundException('Goal not found');
    }
    Object.assign(goal, dto);
    if (goal.target > 0) {
      goal.progress = Math.min(100, Math.round((goal.currentValue / goal.target) * 100));
    }
    if (goal.progress >= 100) {
      goal.status = 'completed';
    } else if (goal.currentValue > 0 && goal.status === 'not_started') {
      goal.status = 'in_progress';
    }
    await goal.save();
    return serialize(goal);
  }

  async remove(userId: string, id: string) {
    const result = await this.goals.findOneAndDelete({ _id: id, userId: ownedBy(userId) }).exec();
    if (!result) {
      throw new NotFoundException('Goal not found');
    }
    return { deleted: true };
  }
}
