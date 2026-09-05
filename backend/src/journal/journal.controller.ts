import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import { UpsertJournalDto } from './dto/journal.dto.js';
import { JournalService } from './journal.service.js';

@Controller('journal')
export class JournalController {
  constructor(private readonly journal: JournalService) {}

  @Get()
  list(@CurrentUser('userId') userId: string, @Query('date') date?: string) {
    if (date) {
      return this.journal.getByDate(userId, date);
    }
    return this.journal.list(userId);
  }

  @Post()
  upsert(@CurrentUser('userId') userId: string, @Body() dto: UpsertJournalDto) {
    return this.journal.upsert(userId, dto);
  }
}
