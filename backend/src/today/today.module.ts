import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DayItemsModule } from '../day-items/day-items.module.js';
import { JournalEntry, JournalEntrySchema } from '../journal/schemas/journal-entry.schema.js';
import { PersonalYearsModule } from '../personal-years/personal-years.module.js';
import { Task, TaskSchema } from '../tasks/schemas/task.schema.js';
import { TodayController } from './today.controller.js';
import { TodayService } from './today.service.js';

@Module({
  imports: [
    PersonalYearsModule,
    DayItemsModule,
    MongooseModule.forFeature([
      { name: Task.name, schema: TaskSchema },
      { name: JournalEntry.name, schema: JournalEntrySchema },
    ]),
  ],
  controllers: [TodayController],
  providers: [TodayService],
  exports: [TodayService],
})
export class TodayModule {}
