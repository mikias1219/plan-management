import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { LifeArea, LifeAreaSchema } from '../life-areas/schemas/life-area.schema.js';
import { Habit, HabitSchema } from './schemas/habit.schema.js';
import { HabitsController } from './habits.controller.js';
import { HabitsService } from './habits.service.js';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Habit.name, schema: HabitSchema },
      { name: LifeArea.name, schema: LifeAreaSchema },
    ]),
  ],
  controllers: [HabitsController],
  providers: [HabitsService],
  exports: [HabitsService, MongooseModule],
})
export class HabitsModule {}
