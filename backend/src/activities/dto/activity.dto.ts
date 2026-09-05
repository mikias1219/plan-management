import { Type } from 'class-transformer';
import {
  IsDateString,
  IsIn,
  IsMongoId,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  MinLength,
} from 'class-validator';
import { ACTIVITY_STATUSES } from '../../common/enums.js';

export class CreateActivityDto {
  @IsOptional()
  @IsMongoId()
  habitId?: string;

  @IsMongoId()
  lifeAreaId: string;

  @IsDateString()
  date: string;

  @IsString()
  @MinLength(1)
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  startTime?: string;

  @IsOptional()
  @IsString()
  endTime?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  durationMinutes?: number;

  @IsIn(ACTIVITY_STATUSES)
  status: (typeof ACTIVITY_STATUSES)[number];

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsMongoId()
  relatedGoalId?: string;

  @IsOptional()
  @IsMongoId()
  relatedTaskId?: string;

  @IsOptional()
  @IsMongoId()
  relatedDocumentId?: string;

  @IsOptional()
  @IsString()
  clientId?: string;
}

export class UpdateActivityDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  durationMinutes?: number;

  @IsOptional()
  @IsIn(ACTIVITY_STATUSES)
  status?: (typeof ACTIVITY_STATUSES)[number];

  @IsOptional()
  @IsString()
  notes?: string;
}
