import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ActivitiesModule } from '../activities/activities.module.js';
import { Activity, ActivitySchema } from '../activities/schemas/activity.schema.js';
import { Habit, HabitSchema } from '../habits/schemas/habit.schema.js';
import { JournalEntry, JournalEntrySchema } from '../journal/schemas/journal-entry.schema.js';
import { PersonalYearsModule } from '../personal-years/personal-years.module.js';
import { Task, TaskSchema } from '../tasks/schemas/task.schema.js';
import { TodayController } from './today.controller.js';
import { TodayService } from './today.service.js';

@Module({
  imports: [
    PersonalYearsModule,
    ActivitiesModule,
    MongooseModule.forFeature([
      { name: Habit.name, schema: HabitSchema },
      { name: Activity.name, schema: ActivitySchema },
      { name: Task.name, schema: TaskSchema },
      { name: JournalEntry.name, schema: JournalEntrySchema },
    ]),
  ],
  controllers: [TodayController],
  providers: [TodayService],
  exports: [TodayService],
})
export class TodayModule {}
