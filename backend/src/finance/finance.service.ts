import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '../common/enums.js';
import { endOfWeek, startOfWeek, toDateString } from '../common/utils/dates.js';
import { oid, ownedBy } from '../common/utils/oid.js';
import { serialize, serializeMany } from '../common/utils/serialize.js';
import {
  CreateTransactionDto,
  FinanceListQueryDto,
  FinanceSummaryQueryDto,
  UpdateTransactionDto,
  UpsertBudgetDto,
} from './dto/finance.dto.js';
import { Budget, BudgetDocument } from './schemas/budget.schema.js';
import { Transaction, TransactionDocument } from './schemas/transaction.schema.js';

type FinancePeriod = 'day' | 'week' | 'month';

function currentMonth() {
  return toDateString(new Date()).slice(0, 7);
}

function currentDate() {
  return toDateString(new Date());
}

function monthRange(month: string) {
  const [year, mon] = month.split('-').map(Number);
  if (!year || !mon || mon < 1 || mon > 12) {
    throw new BadRequestException('Month must be YYYY-MM');
  }
  const from = `${month}-01`;
  const last = new Date(Date.UTC(year, mon, 0)).getUTCDate();
  const to = `${month}-${String(last).padStart(2, '0')}`;
  return { from, to };
}

function resolveRange(query: { period?: FinancePeriod; month?: string; date?: string }) {
  const period: FinancePeriod = query.period ?? (query.month ? 'month' : 'month');
  const date = query.date ?? currentDate();

  if (period === 'day') {
    return { period, from: date, to: date, month: date.slice(0, 7) };
  }
  if (period === 'week') {
    return { period, from: startOfWeek(date), to: endOfWeek(date), month: date.slice(0, 7) };
  }
  const month = query.month ?? date.slice(0, 7);
  const range = monthRange(month);
  return { period: 'month' as const, from: range.from, to: range.to, month };
}

@Injectable()
export class FinanceService {
  constructor(
    @InjectModel(Transaction.name) private readonly transactions: Model<TransactionDocument>,
    @InjectModel(Budget.name) private readonly budgets: Model<BudgetDocument>,
  ) {}

  categories() {
    return { expense: EXPENSE_CATEGORIES, income: INCOME_CATEGORIES };
  }

  async list(userId: string, query: FinanceListQueryDto = {}) {
    const filter: Record<string, unknown> = { userId: ownedBy(userId) };
    if (query.period || query.month || query.date) {
      const { from, to } = resolveRange(query);
      filter.date = { $gte: from, $lte: to };
    } else if (query.month) {
      const { from, to } = monthRange(query.month);
      filter.date = { $gte: from, $lte: to };
    }
    const rows = await this.transactions.find(filter).sort({ date: -1, createdAt: -1 }).limit(200).exec();
    return serializeMany(rows);
  }

  async create(userId: string, dto: CreateTransactionDto) {
    const created = await this.transactions.create({
      ...dto,
      note: dto.note ?? '',
      currency: 'ETB',
      userId: oid(userId),
    });
    return serialize(created);
  }

  async update(userId: string, id: string, dto: UpdateTransactionDto) {
    const updated = await this.transactions
      .findOneAndUpdate({ _id: id, userId: ownedBy(userId) }, { $set: dto }, { new: true })
      .exec();
    if (!updated) {
      throw new NotFoundException('Transaction not found');
    }
    return serialize(updated);
  }

  async remove(userId: string, id: string) {
    const result = await this.transactions.findOneAndDelete({ _id: id, userId: ownedBy(userId) }).exec();
    if (!result) {
      throw new NotFoundException('Transaction not found');
    }
    return { deleted: true };
  }

  async getBudget(userId: string, month = currentMonth()) {
    const row = await this.budgets.findOne({ userId: ownedBy(userId), month }).exec();
    return row ? serialize(row) : { month, amount: 0, id: null };
  }

  async upsertBudget(userId: string, dto: UpsertBudgetDto) {
    const existing = await this.budgets.findOne({ userId: ownedBy(userId), month: dto.month }).exec();
    if (existing) {
      existing.amount = dto.amount;
      await existing.save();
      return serialize(existing);
    }
    const created = await this.budgets.create({ userId: oid(userId), month: dto.month, amount: dto.amount });
    return serialize(created);
  }

  async summary(userId: string, query: FinanceSummaryQueryDto = {}) {
    const { period, from, to, month } = resolveRange({
      period: query.period,
      month: query.month,
      date: query.date,
    });
    const owner = ownedBy(userId);
    const rows = await this.transactions
      .find({ userId: owner, date: { $gte: from, $lte: to } })
      .sort({ date: -1, createdAt: -1 })
      .exec();
    const budget = await this.budgets.findOne({ userId: owner, month }).exec();

    let income = 0;
    let expense = 0;
    const byCategory = new Map<string, number>();
    const byDay = new Map<string, { income: number; expense: number }>();

    for (const row of rows) {
      const day = byDay.get(row.date) ?? { income: 0, expense: 0 };
      if (row.type === 'income') {
        income += row.amount;
        day.income += row.amount;
      } else {
        expense += row.amount;
        day.expense += row.amount;
        byCategory.set(row.category, (byCategory.get(row.category) ?? 0) + row.amount);
      }
      byDay.set(row.date, day);
    }

    const budgetAmount = budget?.amount ?? 0;
    const remaining = budgetAmount > 0 ? budgetAmount - (period === 'month' ? expense : 0) : null;
    // Budget applies to the calendar month; for day/week show month budget context separately
    const monthExpenseRows =
      period === 'month'
        ? rows
        : await this.transactions
            .find({
              userId: owner,
              type: 'expense',
              date: { $gte: `${month}-01`, $lte: monthRange(month).to },
            })
            .exec();
    const monthExpense =
      period === 'month'
        ? expense
        : monthExpenseRows.reduce((sum, row) => sum + row.amount, 0);
    const percentUsed = budgetAmount > 0 ? Math.round((monthExpense / budgetAmount) * 100) : 0;
    const topCategory = [...byCategory.entries()].sort((a, b) => b[1] - a[1])[0];

    return {
      period,
      month,
      from,
      to,
      income: roundMoney(income),
      expense: roundMoney(expense),
      net: roundMoney(income - expense),
      budget: budgetAmount,
      remaining: budgetAmount > 0 ? roundMoney(budgetAmount - monthExpense) : null,
      percentUsed,
      monthExpense: roundMoney(monthExpense),
      onTrack: budgetAmount === 0 ? null : monthExpense <= budgetAmount,
      topCategory: topCategory
        ? { category: topCategory[0], amount: roundMoney(topCategory[1]) }
        : null,
      byCategory: [...byCategory.entries()]
        .map(([category, amount]) => ({
          category,
          amount: roundMoney(amount),
          percent: expense > 0 ? Math.round((amount / expense) * 100) : 0,
        }))
        .sort((a, b) => b.amount - a.amount),
      byDay: [...byDay.entries()]
        .map(([date, totals]) => ({
          date,
          income: roundMoney(totals.income),
          expense: roundMoney(totals.expense),
          net: roundMoney(totals.income - totals.expense),
        }))
        .sort((a, b) => b.date.localeCompare(a.date)),
      recent: serializeMany(rows.slice(0, 30)),
      count: rows.length,
    };
  }
}

function roundMoney(value: number) {
  return Math.round(value * 100) / 100;
}
