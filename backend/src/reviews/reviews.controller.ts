import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { IsOptional, IsString } from 'class-validator';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import { ReviewsService } from './reviews.service.js';

class ReflectionDto {
  @IsOptional()
  @IsString()
  date?: string;

  @IsString()
  wentWell: string;

  @IsString()
  shouldImprove: string;
}

@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviews: ReviewsService) {}

  @Get('weekly')
  weekly(@CurrentUser('userId') userId: string, @Query('date') date?: string) {
    return this.reviews.getPeriod(userId, 'weekly', date);
  }

  @Get('monthly')
  monthly(@CurrentUser('userId') userId: string, @Query('date') date?: string) {
    return this.reviews.getPeriod(userId, 'monthly', date);
  }

  @Get('yearly')
  yearly(@CurrentUser('userId') userId: string, @Query('date') date?: string) {
    return this.reviews.getPeriod(userId, 'yearly', date);
  }

  @Post(':type')
  save(
    @CurrentUser('userId') userId: string,
    @Param('type') type: 'weekly' | 'monthly' | 'yearly',
    @Body() dto: ReflectionDto,
  ) {
    return this.reviews.saveReflection(
      userId,
      type,
      dto.date ?? new Date().toISOString().slice(0, 10),
      dto.wentWell,
      dto.shouldImprove,
    );
  }
}
