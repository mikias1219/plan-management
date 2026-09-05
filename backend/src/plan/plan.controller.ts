import { Controller, Get, Query } from '@nestjs/common';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import { PlanService } from './plan.service.js';

@Controller('plan')
export class PlanController {
  constructor(private readonly plan: PlanService) {}

  @Get()
  get(
    @CurrentUser('userId') userId: string,
    @Query('view') view: 'day' | 'week' | 'month' | 'year' = 'day',
    @Query('date') date?: string,
  ) {
    return this.plan.get(userId, view, date);
  }
}
