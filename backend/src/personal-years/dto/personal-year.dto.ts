import { IsDateString, IsOptional } from 'class-validator';

export class CreatePersonalYearDto {
  @IsDateString()
  startDate: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;
}
