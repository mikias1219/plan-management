import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Achievement, AchievementSchema } from '../achievements/schemas/achievement.schema.js';
import { DayItem, DayItemSchema } from '../day-items/schemas/day-item.schema.js';
import { Goal, GoalSchema } from '../goals/schemas/goal.schema.js';
import { Knowledge, KnowledgeSchema } from '../knowledge/schemas/knowledge.schema.js';
import { PersonalYearsModule } from '../personal-years/personal-years.module.js';
import { Task, TaskSchema } from '../tasks/schemas/task.schema.js';
import { Review, ReviewSchema } from './schemas/review.schema.js';
import { ReviewsController } from './reviews.controller.js';
import { ReviewsService } from './reviews.service.js';

@Module({
  imports: [
    PersonalYearsModule,
    MongooseModule.forFeature([
      { name: Review.name, schema: ReviewSchema },
      { name: DayItem.name, schema: DayItemSchema },
      { name: Task.name, schema: TaskSchema },
      { name: Goal.name, schema: GoalSchema },
      { name: Knowledge.name, schema: KnowledgeSchema },
      { name: Achievement.name, schema: AchievementSchema },
    ]),
  ],
  controllers: [ReviewsController],
  providers: [ReviewsService],
  exports: [ReviewsService],
})
export class ReviewsModule {}
