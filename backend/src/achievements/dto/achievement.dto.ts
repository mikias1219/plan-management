import { IsDateString, IsMongoId, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateAchievementDto {
  @IsString()
  @MinLength(1)
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsDateString()
  date: string;

  @IsOptional()
  @IsMongoId()
  lifeAreaId?: string;

  @IsOptional()
  @IsMongoId()
  goalId?: string;

  @IsOptional()
  @IsMongoId()
  activityId?: string;

  @IsOptional()
  @IsMongoId()
  documentId?: string;
}
