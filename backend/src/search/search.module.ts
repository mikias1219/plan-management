import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Achievement, AchievementSchema } from '../achievements/schemas/achievement.schema.js';
import { Activity, ActivitySchema } from '../activities/schemas/activity.schema.js';
import { DocumentRecord, DocumentRecordSchema } from '../documents/schemas/document-record.schema.js';
import { Goal, GoalSchema } from '../goals/schemas/goal.schema.js';
import { Habit, HabitSchema } from '../habits/schemas/habit.schema.js';
import { JournalEntry, JournalEntrySchema } from '../journal/schemas/journal-entry.schema.js';
import { Knowledge, KnowledgeSchema } from '../knowledge/schemas/knowledge.schema.js';
import { Task, TaskSchema } from '../tasks/schemas/task.schema.js';
import { Transaction, TransactionSchema } from '../finance/schemas/transaction.schema.js';
import { SearchController } from './search.controller.js';
import { SearchService } from './search.service.js';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Habit.name, schema: HabitSchema },
      { name: Activity.name, schema: ActivitySchema },
      { name: Task.name, schema: TaskSchema },
      { name: Goal.name, schema: GoalSchema },
      { name: Knowledge.name, schema: KnowledgeSchema },
      { name: JournalEntry.name, schema: JournalEntrySchema },
      { name: Achievement.name, schema: AchievementSchema },
      { name: DocumentRecord.name, schema: DocumentRecordSchema },
      { name: Transaction.name, schema: TransactionSchema },
    ]),
  ],
  controllers: [SearchController],
  providers: [SearchService],
})
export class SearchModule {}
