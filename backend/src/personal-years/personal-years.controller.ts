import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import { CreatePersonalYearDto } from './dto/personal-year.dto.js';
import { PersonalYearsService } from './personal-years.service.js';

@Controller('personal-years')
export class PersonalYearsController {
  constructor(private readonly years: PersonalYearsService) {}

  @Get()
  list(@CurrentUser('userId') userId: string) {
    return this.years.list(userId);
  }

  @Get('active')
  active(@CurrentUser('userId') userId: string) {
    return this.years.getActive(userId);
  }

  @Post()
  create(@CurrentUser('userId') userId: string, @Body() dto: CreatePersonalYearDto) {
    return this.years.create(userId, dto);
  }

  @Get(':id')
  findOne(@CurrentUser('userId') userId: string, @Param('id') id: string) {
    return this.years.findOne(userId, id);
  }
}
