import { Controller, Get, Query } from '@nestjs/common';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import { TodayService } from './today.service.js';

@Controller('today')
export class TodayController {
  constructor(private readonly today: TodayService) {}

  @Get()
  getToday(@CurrentUser('userId') userId: string, @Query('date') date?: string) {
    return this.today.getToday(userId, date);
  }
}
