import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DayItem, DayItemSchema } from '../day-items/schemas/day-item.schema.js';
import { Goal, GoalSchema } from '../goals/schemas/goal.schema.js';
import { ReviewsModule } from '../reviews/reviews.module.js';
import { Task, TaskSchema } from '../tasks/schemas/task.schema.js';
import { AnalyticsController } from './analytics.controller.js';
import { AnalyticsService } from './analytics.service.js';

@Module({
  imports: [
    ReviewsModule,
    MongooseModule.forFeature([
      { name: DayItem.name, schema: DayItemSchema },
      { name: Task.name, schema: TaskSchema },
      { name: Goal.name, schema: GoalSchema },
    ]),
  ],
  controllers: [AnalyticsController],
  providers: [AnalyticsService],
})
export class AnalyticsModule {}
