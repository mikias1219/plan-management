import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import { CreateDayItemDto, DayItemQueryDto, SetDayItemStatusDto, UpdateDayItemDto } from './dto/day-item.dto.js';
import { DayItemsService } from './day-items.service.js';

@Controller('day-items')
export class DayItemsController {
  constructor(private readonly dayItems: DayItemsService) {}

  @Get()
  list(@CurrentUser('userId') userId: string, @Query() query: DayItemQueryDto) {
    return this.dayItems.list(userId, query);
  }

  @Post()
  create(@CurrentUser('userId') userId: string, @Body() dto: CreateDayItemDto) {
    return this.dayItems.create(userId, dto);
  }

  @Patch(':id')
  update(@CurrentUser('userId') userId: string, @Param('id') id: string, @Body() dto: UpdateDayItemDto) {
    return this.dayItems.update(userId, id, dto);
  }

  @Patch(':id/status')
  setStatus(@CurrentUser('userId') userId: string, @Param('id') id: string, @Body() body: SetDayItemStatusDto) {
    return this.dayItems.setStatus(userId, id, body.status);
  }

  @Delete(':id')
  remove(@CurrentUser('userId') userId: string, @Param('id') id: string) {
    return this.dayItems.remove(userId, id);
  }
}
