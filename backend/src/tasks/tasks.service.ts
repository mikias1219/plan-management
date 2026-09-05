import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { oid, ownedBy } from '../common/utils/oid.js';
import { serialize, serializeMany } from '../common/utils/serialize.js';
import { CreateTaskDto, UpdateTaskDto } from './dto/task.dto.js';
import { Task, TaskDocument } from './schemas/task.schema.js';

@Injectable()
export class TasksService {
  constructor(@InjectModel(Task.name) private readonly tasks: Model<TaskDocument>) {}

  async list(userId: string, status?: string) {
    const filter: Record<string, unknown> = { userId: ownedBy(userId) };
    if (status) {
      filter.status = status;
    }
    const rows = await this.tasks.find(filter).sort({ dueDate: 1, createdAt: -1 }).exec();
    return serializeMany(rows);
  }

  async create(userId: string, dto: CreateTaskDto) {
    const created = await this.tasks.create({ ...dto, userId: oid(userId), status: 'not_started' });
    return serialize(created);
  }

  async findOne(userId: string, id: string) {
    const task = await this.tasks.findOne({ _id: id, userId: ownedBy(userId) }).exec();
    if (!task) {
      throw new NotFoundException('Task not found');
    }
    return serialize(task);
  }

  async update(userId: string, id: string, dto: UpdateTaskDto) {
    const updated = await this.tasks
      .findOneAndUpdate({ _id: id, userId: ownedBy(userId) }, { $set: dto }, { new: true })
      .exec();
    if (!updated) {
      throw new NotFoundException('Task not found');
    }
    return serialize(updated);
  }

  async remove(userId: string, id: string) {
    const result = await this.tasks.findOneAndDelete({ _id: id, userId: ownedBy(userId) }).exec();
    if (!result) {
      throw new NotFoundException('Task not found');
    }
    return { deleted: true };
  }
}
