import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsIn,
  IsInt,
  IsMongoId,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  MinLength,
} from 'class-validator';
import { CAPTURE_STYLES, HABIT_FREQUENCIES, HABIT_UNITS } from '../../common/enums.js';

export class CreateHabitDto {
  @IsString()
  @MinLength(1)
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsMongoId()
  lifeAreaId: string;

  @IsIn(HABIT_FREQUENCIES)
  frequency: (typeof HABIT_FREQUENCIES)[number];

  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  selectedDays?: number[];

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  target: number;

  @IsIn(HABIT_UNITS)
  unit: (typeof HABIT_UNITS)[number];

  @IsOptional()
  @IsString()
  startDate?: string;

  @IsOptional()
  @IsString()
  endDate?: string;

  @IsOptional()
  @IsString()
  color?: string;

  @IsIn(CAPTURE_STYLES)
  captureStyle: (typeof CAPTURE_STYLES)[number];
}

export class UpdateHabitDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsMongoId()
  lifeAreaId?: string;

  @IsOptional()
  @IsIn(HABIT_FREQUENCIES)
  frequency?: (typeof HABIT_FREQUENCIES)[number];

  @IsOptional()
  @IsArray()
  selectedDays?: number[];

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  target?: number;

  @IsOptional()
  @IsIn(HABIT_UNITS)
  unit?: (typeof HABIT_UNITS)[number];

  @IsOptional()
  @IsString()
  startDate?: string;

  @IsOptional()
  @IsString()
  endDate?: string;

  @IsOptional()
  @IsBoolean()
  active?: boolean;

  @IsOptional()
  @IsIn(CAPTURE_STYLES)
  captureStyle?: (typeof CAPTURE_STYLES)[number];
}
