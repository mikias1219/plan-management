import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Achievement, AchievementSchema } from '../achievements/schemas/achievement.schema.js';
import { Activity, ActivitySchema } from '../activities/schemas/activity.schema.js';
import { Goal, GoalSchema } from '../goals/schemas/goal.schema.js';
import { Habit, HabitSchema } from '../habits/schemas/habit.schema.js';
import { Knowledge, KnowledgeSchema } from '../knowledge/schemas/knowledge.schema.js';
import { LifeArea, LifeAreaSchema } from '../life-areas/schemas/life-area.schema.js';
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
      { name: Activity.name, schema: ActivitySchema },
      { name: Habit.name, schema: HabitSchema },
      { name: Task.name, schema: TaskSchema },
      { name: Goal.name, schema: GoalSchema },
      { name: Knowledge.name, schema: KnowledgeSchema },
      { name: Achievement.name, schema: AchievementSchema },
      { name: LifeArea.name, schema: LifeAreaSchema },
    ]),
  ],
  controllers: [ReviewsController],
  providers: [ReviewsService],
  exports: [ReviewsService],
})
export class ReviewsModule {}
