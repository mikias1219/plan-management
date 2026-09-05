import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import { CreateLifeAreaDto, UpdateLifeAreaDto } from './dto/life-area.dto.js';
import { LifeAreasService } from './life-areas.service.js';

@Controller('life-areas')
export class LifeAreasController {
  constructor(private readonly lifeAreas: LifeAreasService) {}

  @Get()
  list(@CurrentUser('userId') userId: string) {
    return this.lifeAreas.list(userId);
  }

  @Post()
  create(@CurrentUser('userId') userId: string, @Body() dto: CreateLifeAreaDto) {
    return this.lifeAreas.create(userId, dto);
  }

  @Patch(':id')
  update(
    @CurrentUser('userId') userId: string,
    @Param('id') id: string,
    @Body() dto: UpdateLifeAreaDto,
  ) {
    return this.lifeAreas.update(userId, id, dto);
  }
}
