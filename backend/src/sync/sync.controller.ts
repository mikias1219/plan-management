import { Body, Controller, Post } from '@nestjs/common';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import { SyncPushDto } from './dto/sync.dto.js';
import { SyncService } from './sync.service.js';

@Controller('sync')
export class SyncController {
  constructor(private readonly sync: SyncService) {}

  @Post('push')
  push(@CurrentUser('userId') userId: string, @Body() dto: SyncPushDto) {
    return this.sync.push(userId, dto);
  }
}
