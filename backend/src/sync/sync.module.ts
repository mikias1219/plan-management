import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ActivitiesModule } from '../activities/activities.module.js';
import { JournalModule } from '../journal/journal.module.js';
import { KnowledgeModule } from '../knowledge/knowledge.module.js';
import { TasksModule } from '../tasks/tasks.module.js';
import { SyncJob, SyncJobSchema } from './schemas/sync-job.schema.js';
import { SyncController } from './sync.controller.js';
import { SyncService } from './sync.service.js';

@Module({
  imports: [
    ActivitiesModule,
    TasksModule,
    JournalModule,
    KnowledgeModule,
    MongooseModule.forFeature([{ name: SyncJob.name, schema: SyncJobSchema }]),
  ],
  controllers: [SyncController],
  providers: [SyncService],
})
export class SyncModule {}
