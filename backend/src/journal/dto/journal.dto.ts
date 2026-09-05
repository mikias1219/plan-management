import { IsDateString, IsOptional, IsString } from 'class-validator';

export class UpsertJournalDto {
  @IsDateString()
  date: string;

  @IsOptional()
  @IsString()
  wentWell?: string;

  @IsOptional()
  @IsString()
  accomplished?: string;

  @IsOptional()
  @IsString()
  failedToComplete?: string;

  @IsOptional()
  @IsString()
  learned?: string;

  @IsOptional()
  @IsString()
  improveTomorrow?: string;
}
