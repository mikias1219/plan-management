import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Activity, ActivitySchema } from '../activities/schemas/activity.schema.js';
import { Goal, GoalSchema } from '../goals/schemas/goal.schema.js';
import { Habit, HabitSchema } from '../habits/schemas/habit.schema.js';
import { LifeArea, LifeAreaSchema } from '../life-areas/schemas/life-area.schema.js';
import { ReviewsModule } from '../reviews/reviews.module.js';
import { Task, TaskSchema } from '../tasks/schemas/task.schema.js';
import { AnalyticsController } from './analytics.controller.js';
import { AnalyticsService } from './analytics.service.js';

@Module({
  imports: [
    ReviewsModule,
    MongooseModule.forFeature([
      { name: Activity.name, schema: ActivitySchema },
      { name: Habit.name, schema: HabitSchema },
      { name: Task.name, schema: TaskSchema },
      { name: Goal.name, schema: GoalSchema },
      { name: LifeArea.name, schema: LifeAreaSchema },
    ]),
  ],
  controllers: [AnalyticsController],
  providers: [AnalyticsService],
})
export class AnalyticsModule {}
