import { IsMongoId, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateDocumentDto {
  @IsString()
  @MinLength(1)
  title: string;

  @IsOptional()
  @IsMongoId()
  lifeAreaId?: string;

  @IsOptional()
  @IsString()
  topic?: string;

  @IsOptional()
  @IsString()
  content?: string;

  @IsOptional()
  @IsString()
  googleDocumentId?: string;
}

export class UpdateDocumentDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  localContent?: string;

  @IsOptional()
  @IsString()
  topic?: string;
}
