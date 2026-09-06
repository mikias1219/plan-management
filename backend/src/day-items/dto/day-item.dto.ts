import { Type } from 'class-transformer';
import { IsDateString, IsIn, IsNumber, IsOptional, IsString, Matches, Min, MinLength } from 'class-validator';
import { DAY_ITEM_STATUSES, DAY_ITEM_UNITS } from '../../common/enums.js';

export class CreateDayItemDto {
  @IsDateString()
  date: string;

  @IsString()
  @MinLength(1)
  title: string;

  @Type(() => Number)
  @IsNumber()
  @Min(1)
  target: number;

  @IsOptional()
  @IsIn(DAY_ITEM_UNITS)
  unit?: (typeof DAY_ITEM_UNITS)[number];

  @IsOptional()
  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/)
  plannedTime?: string;

  @IsOptional()
  @IsString()
  note?: string;
}

export class UpdateDayItemDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  title?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  target?: number;

  @IsOptional()
  @IsIn(DAY_ITEM_UNITS)
  unit?: (typeof DAY_ITEM_UNITS)[number];

  @IsOptional()
  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/)
  plannedTime?: string;

  @IsOptional()
  @IsIn(DAY_ITEM_STATUSES)
  status?: (typeof DAY_ITEM_STATUSES)[number];

  @IsOptional()
  @IsString()
  note?: string;

  @IsOptional()
  @IsDateString()
  date?: string;
}

export class DayItemQueryDto {
  @IsOptional()
  @IsDateString()
  date?: string;

  @IsOptional()
  @IsDateString()
  from?: string;

  @IsOptional()
  @IsDateString()
  to?: string;
}

export class SetDayItemStatusDto {
  @IsIn(DAY_ITEM_STATUSES)
  status: (typeof DAY_ITEM_STATUSES)[number];
}
