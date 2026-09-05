import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ownedBy } from '../common/utils/oid.js';
import { serializeMany } from '../common/utils/serialize.js';
import { Achievement, AchievementDocument } from '../achievements/schemas/achievement.schema.js';
import { Activity, ActivityDocument } from '../activities/schemas/activity.schema.js';
import { DocumentRecord, DocumentRecordDocument } from '../documents/schemas/document-record.schema.js';
import { Goal, GoalDocument } from '../goals/schemas/goal.schema.js';
import { Habit, HabitDocument } from '../habits/schemas/habit.schema.js';
import { JournalEntry, JournalEntryDocument } from '../journal/schemas/journal-entry.schema.js';
import { Knowledge, KnowledgeDocument } from '../knowledge/schemas/knowledge.schema.js';
import { Transaction, TransactionDocument } from '../finance/schemas/transaction.schema.js';
import { Task, TaskDocument } from '../tasks/schemas/task.schema.js';

@Injectable()
export class SearchService {
  constructor(
    @InjectModel(Habit.name) private readonly habits: Model<HabitDocument>,
    @InjectModel(Activity.name) private readonly activities: Model<ActivityDocument>,
    @InjectModel(Task.name) private readonly tasks: Model<TaskDocument>,
    @InjectModel(Goal.name) private readonly goals: Model<GoalDocument>,
    @InjectModel(Knowledge.name) private readonly knowledge: Model<KnowledgeDocument>,
    @InjectModel(JournalEntry.name) private readonly journal: Model<JournalEntryDocument>,
    @InjectModel(Achievement.name) private readonly achievements: Model<AchievementDocument>,
    @InjectModel(DocumentRecord.name) private readonly documents: Model<DocumentRecordDocument>,
    @InjectModel(Transaction.name) private readonly transactions: Model<TransactionDocument>,
  ) {}

  async search(userId: string, q: string) {
    const query = q.trim();
    if (query.length < 2) {
      return {
        habits: [],
        activities: [],
        tasks: [],
        goals: [],
        knowledge: [],
        journal: [],
        achievements: [],
        documents: [],
        transactions: [],
      };
    }

    const regex = new RegExp(query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    const owner = ownedBy(userId);

    const [habits, activities, tasks, goals, knowledge, journal, achievements, documents, transactions] = await Promise.all([
      this.habits.find({ userId: owner, name: regex }).limit(10).exec(),
      this.activities.find({ userId: owner, title: regex }).limit(10).exec(),
      this.tasks.find({ userId: owner, $or: [{ title: regex }, { description: regex }] }).limit(10).exec(),
      this.goals.find({ userId: owner, $or: [{ title: regex }, { description: regex }] }).limit(10).exec(),
      this.knowledge.find({ userId: owner, $or: [{ title: regex }, { content: regex }, { topic: regex }] }).limit(10).exec(),
      this.journal
        .find({
          userId: owner,
          $or: [{ wentWell: regex }, { learned: regex }, { accomplished: regex }],
        })
        .limit(10)
        .exec(),
      this.achievements.find({ userId: owner, $or: [{ title: regex }, { description: regex }] }).limit(10).exec(),
      this.documents.find({ userId: owner, $or: [{ title: regex }, { topic: regex }] }).limit(10).exec(),
      this.transactions
        .find({ userId: owner, $or: [{ note: regex }, { category: regex }] })
        .limit(10)
        .exec(),
    ]);

    return {
      habits: serializeMany(habits),
      activities: serializeMany(activities),
      tasks: serializeMany(tasks),
      goals: serializeMany(goals),
      knowledge: serializeMany(knowledge),
      journal: serializeMany(journal),
      achievements: serializeMany(achievements),
      documents: serializeMany(documents),
      transactions: serializeMany(transactions),
    };
  }
}
