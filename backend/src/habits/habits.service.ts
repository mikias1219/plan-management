import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { oid, ownedBy } from '../common/utils/oid.js';
import { serialize, serializeMany } from '../common/utils/serialize.js';
import { DEFAULT_HABITS } from '../life-areas/defaults.js';
import { LifeArea, LifeAreaDocument } from '../life-areas/schemas/life-area.schema.js';
import { CreateHabitDto, UpdateHabitDto } from './dto/habit.dto.js';
import { Habit, HabitDocument } from './schemas/habit.schema.js';

@Injectable()
export class HabitsService {
  constructor(
    @InjectModel(Habit.name) private readonly habits: Model<HabitDocument>,
    @InjectModel(LifeArea.name) private readonly areas: Model<LifeAreaDocument>,
  ) {}

  async ensureDefaults(userId: string) {
    const uid = oid(userId);
    const count = await this.habits.countDocuments({ userId: ownedBy(userId) }).exec();
    if (count > 0) {
      return this.list(userId);
    }

    const areas = await this.areas.find({ userId: ownedBy(userId) }).exec();
    const bySlug = new Map(areas.map((area) => [area.slug, area]));

    await this.habits.insertMany(
      DEFAULT_HABITS.flatMap((habit) => {
        const area = bySlug.get(habit.slugArea);
        if (!area) {
          return [];
        }
        return [
          {
            userId: uid,
            name: habit.name,
            description: '',
            lifeAreaId: area._id,
            frequency: habit.frequency,
            selectedDays: habit.selectedDays,
            target: habit.target,
            unit: habit.unit,
            active: true,
            color: area.color,
            captureStyle: habit.captureStyle,
          },
        ];
      }),
    );

    return this.list(userId);
  }

  async list(userId: string, active?: boolean) {
    const filter: Record<string, unknown> = { userId: ownedBy(userId) };
    if (active != null) {
      filter.active = active;
    }
    const rows = await this.habits.find(filter).sort({ name: 1 }).exec();
    return serializeMany(rows);
  }

  async create(userId: string, dto: CreateHabitDto) {
    const created = await this.habits.create({ ...dto, userId: oid(userId), active: true });
    return serialize(created);
  }

  async findOne(userId: string, id: string) {
    const habit = await this.habits.findOne({ _id: id, userId: ownedBy(userId) }).exec();
    if (!habit) {
      throw new NotFoundException('Habit not found');
    }
    return serialize(habit);
  }

  async update(userId: string, id: string, dto: UpdateHabitDto) {
    const updated = await this.habits
      .findOneAndUpdate({ _id: id, userId: ownedBy(userId) }, { $set: dto }, { new: true })
      .exec();
    if (!updated) {
      throw new NotFoundException('Habit not found');
    }
    return serialize(updated);
  }

  async remove(userId: string, id: string) {
    const updated = await this.habits
      .findOneAndUpdate({ _id: id, userId: ownedBy(userId) }, { $set: { active: false } }, { new: true })
      .exec();
    if (!updated) {
      throw new NotFoundException('Habit not found');
    }
    return serialize(updated);
  }
}
