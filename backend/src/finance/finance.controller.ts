import { Body, Controller, Delete, Get, Param, Patch, Post, Put, Query } from '@nestjs/common';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import { CreateTransactionDto, MonthQueryDto, UpdateTransactionDto, UpsertBudgetDto } from './dto/finance.dto.js';
import { FinanceService } from './finance.service.js';

@Controller('finance')
export class FinanceController {
  constructor(private readonly finance: FinanceService) {}

  @Get('categories')
  categories() {
    return this.finance.categories();
  }

  @Get('summary')
  summary(@CurrentUser('userId') userId: string, @Query() query: MonthQueryDto) {
    return this.finance.summary(userId, query.month);
  }

  @Get('budget')
  budget(@CurrentUser('userId') userId: string, @Query() query: MonthQueryDto) {
    return this.finance.getBudget(userId, query.month);
  }

  @Put('budget')
  upsertBudget(@CurrentUser('userId') userId: string, @Body() dto: UpsertBudgetDto) {
    return this.finance.upsertBudget(userId, dto);
  }

  @Get('transactions')
  list(@CurrentUser('userId') userId: string, @Query() query: MonthQueryDto) {
    return this.finance.list(userId, query.month);
  }

  @Post('transactions')
  create(@CurrentUser('userId') userId: string, @Body() dto: CreateTransactionDto) {
    return this.finance.create(userId, dto);
  }

  @Patch('transactions/:id')
  update(
    @CurrentUser('userId') userId: string,
    @Param('id') id: string,
    @Body() dto: UpdateTransactionDto,
  ) {
    return this.finance.update(userId, id, dto);
  }

  @Delete('transactions/:id')
  remove(@CurrentUser('userId') userId: string, @Param('id') id: string) {
    return this.finance.remove(userId, id);
  }
}
