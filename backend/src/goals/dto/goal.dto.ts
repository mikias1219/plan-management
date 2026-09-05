import { Type } from 'class-transformer';
import { IsDateString, IsIn, IsMongoId, IsNumber, IsOptional, IsString, Min, MinLength } from 'class-validator';
import { GOAL_PERIODS, GOAL_STATUSES } from '../../common/enums.js';

export class CreateGoalDto {
  @IsString()
  @MinLength(1)
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsMongoId()
  lifeAreaId: string;

  @IsOptional()
  @IsMongoId()
  parentGoalId?: string;

  @IsOptional()
  @IsMongoId()
  personalYearId?: string;

  @IsIn(GOAL_PERIODS)
  period: (typeof GOAL_PERIODS)[number];

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  target?: number;

  @IsOptional()
  @IsString()
  unit?: string;
}

export class UpdateGoalDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsIn(GOAL_STATUSES)
  status?: (typeof GOAL_STATUSES)[number];

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  currentValue?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  target?: number;
}
