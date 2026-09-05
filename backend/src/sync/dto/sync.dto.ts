import { Type } from 'class-transformer';
import { IsArray, IsIn, IsObject, IsOptional, IsString, ValidateNested } from 'class-validator';

export class SyncOperationDto {
  @IsString()
  clientId: string;

  @IsIn(['activity', 'task', 'journal', 'knowledge'])
  entityType: 'activity' | 'task' | 'journal' | 'knowledge';

  @IsIn(['create', 'update'])
  action: 'create' | 'update';

  @IsObject()
  payload: Record<string, unknown>;
}

export class SyncPushDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SyncOperationDto)
  operations: SyncOperationDto[];
}
