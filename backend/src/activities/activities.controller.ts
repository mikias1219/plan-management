import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import { CreateActivityDto, UpdateActivityDto } from './dto/activity.dto.js';
import { ActivitiesService } from './activities.service.js';

@Controller('activities')
export class ActivitiesController {
  constructor(private readonly activities: ActivitiesService) {}

  @Get()
  list(
    @CurrentUser('userId') userId: string,
    @Query('date') date?: string,
    @Query('habitId') habitId?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.activities.list(userId, { date, habitId, from, to });
  }

  @Post()
  create(@CurrentUser('userId') userId: string, @Body() dto: CreateActivityDto) {
    return this.activities.create(userId, dto);
  }

  @Patch(':id')
  update(
    @CurrentUser('userId') userId: string,
    @Param('id') id: string,
    @Body() dto: UpdateActivityDto,
  ) {
    return this.activities.update(userId, id, dto);
  }

  @Delete(':id')
  remove(@CurrentUser('userId') userId: string, @Param('id') id: string) {
    return this.activities.remove(userId, id);
  }
}
