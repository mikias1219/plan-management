import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { isHabitDueOnDate, toDateString } from '../common/utils/dates.js';
import { ownedBy } from '../common/utils/oid.js';
import { serialize, serializeMany } from '../common/utils/serialize.js';
import { ActivitiesService } from '../activities/activities.service.js';
import { Habit, HabitDocument } from '../habits/schemas/habit.schema.js';
import { Activity, ActivityDocument } from '../activities/schemas/activity.schema.js';
import { JournalEntry, JournalEntryDocument } from '../journal/schemas/journal-entry.schema.js';
import { PersonalYearsService } from '../personal-years/personal-years.service.js';
import { Task, TaskDocument } from '../tasks/schemas/task.schema.js';

@Injectable()
export class TodayService {
  constructor(
    private readonly years: PersonalYearsService,
    private readonly activitiesService: ActivitiesService,
    @InjectModel(Habit.name) private readonly habits: Model<HabitDocument>,
    @InjectModel(Activity.name) private readonly activities: Model<ActivityDocument>,
    @InjectModel(Task.name) private readonly tasks: Model<TaskDocument>,
    @InjectModel(JournalEntry.name) private readonly journal: Model<JournalEntryDocument>,
  ) {}

  async getToday(userId: string, dateParam?: string) {
    const date = (dateParam ?? toDateString(new Date())).slice(0, 10);
    const today = toDateString(new Date());
    const personalYear = await this.years.getActive(userId, date);

    const habits = await this.habits.find({ userId: ownedBy(userId), active: true }).exec();
    const dueHabits = habits.filter((habit) =>
      isHabitDueOnDate({
        frequency: habit.frequency,
        selectedDays: habit.selectedDays,
        startDate: habit.startDate,
        endDate: habit.endDate,
        date,
      }),
    );

    if (date < today) {
      for (const habit of dueHabits) {
        await this.activitiesService.markMissedIfNeeded(userId, habit, date);
      }
    }

    const dayActivities = await this.activities.find({ userId: ownedBy(userId), date }).exec();
    const byHabit = new Map<string, typeof dayActivities>();
    for (const activity of dayActivities) {
      if (!activity.habitId) {
        continue;
      }
      const key = String(activity.habitId);
      const list = byHabit.get(key) ?? [];
      list.push(activity);
      byHabit.set(key, list);
    }

    const habitRows = dueHabits.map((habit) => {
      const items = byHabit.get(String(habit._id)) ?? [];
      const current =
        habit.unit === 'minutes'
          ? items.reduce((sum, item) => sum + (item.durationMinutes || 0), 0)
          : items.filter((item) => item.status === 'completed' || item.status === 'partial').length;
      const qualifying = items.filter((item) => ['completed', 'partial', 'skipped', 'not_applicable'].includes(item.status));
      const missed = items.some((item) => item.status === 'missed') && qualifying.length === 0;
      const complete = habit.unit === 'minutes' ? current >= habit.target : current >= habit.target;
      return {
        ...serialize(habit),
        current,
        complete,
        missed,
        activities: serializeMany(items),
        actionLabel: this.actionLabel(habit.captureStyle, complete, current, habit.target, habit.unit),
      };
    });

    const completedHabits = habitRows.filter((row) => row.complete).length;
    const totalHabits = habitRows.length;
    const percent = totalHabits === 0 ? 0 : Math.round((completedHabits / totalHabits) * 100);

    const openTasks = await this.tasks
      .find({
        userId: ownedBy(userId),
        status: { $in: ['not_started', 'in_progress'] },
        $or: [{ dueDate: { $lte: date } }, { dueDate: { $exists: false } }, { dueDate: null }],
      })
      .sort({ priority: -1, dueDate: 1 })
      .limit(20)
      .exec();

    const priorities = [...openTasks]
      .sort((a, b) => {
        const rank = { high: 3, medium: 2, low: 1 };
        return rank[b.priority] - rank[a.priority];
      })
      .slice(0, 3);

    const journal = await this.journal.findOne({ userId: ownedBy(userId), date }).exec();

    return {
      date,
      greeting: this.greeting(),
      personalYear,
      progress: { percent, completedHabits, totalHabits },
      habits: habitRows,
      priorities: serializeMany(priorities),
      tasks: serializeMany(openTasks),
      activities: serializeMany(dayActivities),
      journal: journal ? { id: String(journal._id), exists: true } : { exists: false },
    };
  }

  private actionLabel(
    style: string,
    complete: boolean,
    current: number,
    target: number,
    unit: string,
  ) {
    if (style === 'complete') {
      return complete ? 'Completed' : 'Mark complete';
    }
    if (style === 'learning') {
      return complete ? 'Add learning' : 'Record learning';
    }
    if (complete) {
      return 'Completed';
    }
    return current > 0 ? 'Continue' : unit === 'minutes' ? 'Record time' : 'Log';
  }

  private greeting() {
    const hour = new Date().getHours();
    if (hour < 12) {
      return 'Good morning';
    }
    if (hour < 18) {
      return 'Good afternoon';
    }
    return 'Good evening';
  }
}
