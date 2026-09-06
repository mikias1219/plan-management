import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DayItemsController } from './day-items.controller.js';
import { DayItemsService } from './day-items.service.js';
import { DayItem, DayItemSchema } from './schemas/day-item.schema.js';

@Module({
  imports: [MongooseModule.forFeature([{ name: DayItem.name, schema: DayItemSchema }])],
  controllers: [DayItemsController],
  providers: [DayItemsService],
  exports: [DayItemsService, MongooseModule],
})
export class DayItemsModule {}
