import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import { CreateDocumentDto, UpdateDocumentDto } from './dto/document.dto.js';
import { DocumentsService } from './documents.service.js';

@Controller('documents')
export class DocumentsController {
  constructor(private readonly documents: DocumentsService) {}

  @Get()
  list(@CurrentUser('userId') userId: string, @Query('lifeAreaId') lifeAreaId?: string) {
    return this.documents.list(userId, lifeAreaId);
  }

  @Get('counts')
  counts(@CurrentUser('userId') userId: string) {
    return this.documents.countsByArea(userId);
  }

  @Post()
  create(@CurrentUser('userId') userId: string, @Body() dto: CreateDocumentDto) {
    return this.documents.create(userId, dto);
  }

  @Get(':id')
  findOne(@CurrentUser('userId') userId: string, @Param('id') id: string) {
    return this.documents.findOne(userId, id);
  }

  @Patch(':id')
  update(
    @CurrentUser('userId') userId: string,
    @Param('id') id: string,
    @Body() dto: UpdateDocumentDto,
  ) {
    return this.documents.update(userId, id, dto);
  }

  @Post(':id/retry-sync')
  retry(@CurrentUser('userId') userId: string, @Param('id') id: string) {
    return this.documents.retrySync(userId, id);
  }
}
