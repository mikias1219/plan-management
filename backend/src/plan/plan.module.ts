import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DayItem, DayItemSchema } from '../day-items/schemas/day-item.schema.js';
import { Goal, GoalSchema } from '../goals/schemas/goal.schema.js';
import { PersonalYearsModule } from '../personal-years/personal-years.module.js';
import { Task, TaskSchema } from '../tasks/schemas/task.schema.js';
import { TodayModule } from '../today/today.module.js';
import { PlanController } from './plan.controller.js';
import { PlanService } from './plan.service.js';

@Module({
  imports: [
    TodayModule,
    PersonalYearsModule,
    MongooseModule.forFeature([
      { name: DayItem.name, schema: DayItemSchema },
      { name: Task.name, schema: TaskSchema },
      { name: Goal.name, schema: GoalSchema },
    ]),
  ],
  controllers: [PlanController],
  providers: [PlanService],
})
export class PlanModule {}
