import { IsArray, IsMongoId, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateKnowledgeDto {
  @IsString()
  @MinLength(1)
  title: string;

  @IsOptional()
  @IsString()
  content?: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsMongoId()
  lifeAreaId: string;

  @IsOptional()
  @IsString()
  topic?: string;

  @IsOptional()
  @IsMongoId()
  relatedHabitId?: string;

  @IsOptional()
  @IsMongoId()
  relatedActivityId?: string;

  @IsOptional()
  @IsMongoId()
  relatedGoalId?: string;

  @IsOptional()
  @IsMongoId()
  documentId?: string;
}

export class UpdateKnowledgeDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  content?: string;

  @IsOptional()
  @IsString()
  topic?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsMongoId()
  documentId?: string;
}
