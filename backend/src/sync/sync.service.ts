import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ActivitiesService } from '../activities/activities.service.js';
import { JournalService } from '../journal/journal.service.js';
import { KnowledgeService } from '../knowledge/knowledge.service.js';
import { TasksService } from '../tasks/tasks.service.js';
import { CreateActivityDto } from '../activities/dto/activity.dto.js';
import { CreateKnowledgeDto } from '../knowledge/dto/knowledge.dto.js';
import { CreateTaskDto } from '../tasks/dto/task.dto.js';
import { UpsertJournalDto } from '../journal/dto/journal.dto.js';
import { SyncPushDto } from './dto/sync.dto.js';
import { SyncJob, SyncJobDocument } from './schemas/sync-job.schema.js';

@Injectable()
export class SyncService {
  constructor(
    private readonly activities: ActivitiesService,
    private readonly tasks: TasksService,
    private readonly journal: JournalService,
    private readonly knowledge: KnowledgeService,
    @InjectModel(SyncJob.name) private readonly jobs: Model<SyncJobDocument>,
  ) {}

  async push(userId: string, dto: SyncPushDto) {
    const results = [];
    for (const operation of dto.operations) {
      try {
        const data = await this.apply(userId, operation.entityType, operation.action, {
          ...operation.payload,
          clientId: operation.clientId,
        });
        await this.jobs.create({
          userId,
          entityType: operation.entityType,
          entityId: (data as { id?: string }).id ?? operation.clientId,
          action: operation.action,
          status: 'synced',
          attempts: 1,
          payload: operation.payload,
        });
        results.push({ clientId: operation.clientId, success: true, data });
      } catch (error) {
        await this.jobs.create({
          userId,
          entityType: operation.entityType,
          entityId: operation.clientId,
          action: operation.action,
          status: 'failed',
          attempts: 1,
          lastError: error instanceof Error ? error.message : 'sync failed',
          payload: operation.payload,
        });
        results.push({
          clientId: operation.clientId,
          success: false,
          message: error instanceof Error ? error.message : 'Could not sync',
        });
      }
    }
    return { results };
  }

  private apply(userId: string, entityType: string, action: string, payload: Record<string, unknown>) {
    if (entityType === 'activity') {
      return this.activities.create(userId, payload as unknown as CreateActivityDto);
    }
    if (entityType === 'task') {
      return this.tasks.create(userId, payload as unknown as CreateTaskDto);
    }
    if (entityType === 'journal') {
      return this.journal.upsert(userId, payload as unknown as UpsertJournalDto);
    }
    if (entityType === 'knowledge') {
      return this.knowledge.create(userId, payload as unknown as CreateKnowledgeDto);
    }
    return Promise.reject(new Error(`Unsupported ${entityType} ${action}`));
  }
}
