import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import { CreateKnowledgeDto, UpdateKnowledgeDto } from './dto/knowledge.dto.js';
import { KnowledgeService } from './knowledge.service.js';

@Controller('knowledge')
export class KnowledgeController {
  constructor(private readonly knowledge: KnowledgeService) {}

  @Get()
  list(
    @CurrentUser('userId') userId: string,
    @Query('lifeAreaId') lifeAreaId?: string,
    @Query('topic') topic?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.knowledge.list(userId, {
      lifeAreaId,
      topic,
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
    });
  }

  @Get('topics')
  topics(@CurrentUser('userId') userId: string, @Query('lifeAreaId') lifeAreaId?: string) {
    return this.knowledge.topics(userId, lifeAreaId);
  }

  @Post()
  create(@CurrentUser('userId') userId: string, @Body() dto: CreateKnowledgeDto) {
    return this.knowledge.create(userId, dto);
  }

  @Get(':id')
  findOne(@CurrentUser('userId') userId: string, @Param('id') id: string) {
    return this.knowledge.findOne(userId, id);
  }

  @Patch(':id')
  update(
    @CurrentUser('userId') userId: string,
    @Param('id') id: string,
    @Body() dto: UpdateKnowledgeDto,
  ) {
    return this.knowledge.update(userId, id, dto);
  }

  @Delete(':id')
  remove(@CurrentUser('userId') userId: string, @Param('id') id: string) {
    return this.knowledge.remove(userId, id);
  }
}
