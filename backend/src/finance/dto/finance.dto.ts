import { Type } from 'class-transformer';
import { IsDateString, IsIn, IsNumber, IsOptional, IsString, Matches, Min } from 'class-validator';
import { EXPENSE_CATEGORIES, FINANCE_TYPES, INCOME_CATEGORIES } from '../../common/enums.js';

const CATEGORIES = [...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES];

export class CreateTransactionDto {
  @IsIn(FINANCE_TYPES)
  type: (typeof FINANCE_TYPES)[number];

  @Type(() => Number)
  @IsNumber()
  @Min(0.01)
  amount: number;

  @IsIn(CATEGORIES)
  category: (typeof CATEGORIES)[number];

  @IsOptional()
  @IsString()
  note?: string;

  @IsDateString()
  date: string;
}

export class UpdateTransactionDto {
  @IsOptional()
  @IsIn(FINANCE_TYPES)
  type?: (typeof FINANCE_TYPES)[number];

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0.01)
  amount?: number;

  @IsOptional()
  @IsIn(CATEGORIES)
  category?: (typeof CATEGORIES)[number];

  @IsOptional()
  @IsString()
  note?: string;

  @IsOptional()
  @IsDateString()
  date?: string;
}

export class UpsertBudgetDto {
  @Matches(/^\d{4}-\d{2}$/)
  month: string;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  amount: number;
}

export class MonthQueryDto {
  @IsOptional()
  @Matches(/^\d{4}-\d{2}$/)
  month?: string;
}
