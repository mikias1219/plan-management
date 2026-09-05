import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '../common/enums.js';
import { oid, ownedBy } from '../common/utils/oid.js';
import { serialize, serializeMany } from '../common/utils/serialize.js';
import { CreateTransactionDto, UpdateTransactionDto, UpsertBudgetDto } from './dto/finance.dto.js';
import { Budget, BudgetDocument } from './schemas/budget.schema.js';
import { Transaction, TransactionDocument } from './schemas/transaction.schema.js';

function currentMonth() {
  return new Date().toISOString().slice(0, 7);
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

@Injectable()
export class FinanceService {
  constructor(
    @InjectModel(Transaction.name) private readonly transactions: Model<TransactionDocument>,
    @InjectModel(Budget.name) private readonly budgets: Model<BudgetDocument>,
  ) {}

  categories() {
    return { expense: EXPENSE_CATEGORIES, income: INCOME_CATEGORIES };
  }

  async list(userId: string, month?: string) {
    const filter: Record<string, unknown> = { userId: ownedBy(userId) };
    if (month) {
      const { from, to } = monthRange(month);
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

  async summary(userId: string, month = currentMonth()) {
    const { from, to } = monthRange(month);
    const owner = ownedBy(userId);
    const rows = await this.transactions
      .find({ userId: owner, date: { $gte: from, $lte: to } })
      .sort({ date: -1, createdAt: -1 })
      .exec();
    const budget = await this.budgets.findOne({ userId: owner, month }).exec();

    let income = 0;
    let expense = 0;
    const byCategory = new Map<string, number>();

    for (const row of rows) {
      if (row.type === 'income') {
        income += row.amount;
      } else {
        expense += row.amount;
        byCategory.set(row.category, (byCategory.get(row.category) ?? 0) + row.amount);
      }
    }

    const budgetAmount = budget?.amount ?? 0;
    const remaining = budgetAmount > 0 ? budgetAmount - expense : null;
    const percentUsed = budgetAmount > 0 ? Math.round((expense / budgetAmount) * 100) : 0;

    return {
      month,
      from,
      to,
      income: roundMoney(income),
      expense: roundMoney(expense),
      net: roundMoney(income - expense),
      budget: budgetAmount,
      remaining: remaining === null ? null : roundMoney(remaining),
      percentUsed,
      onTrack: budgetAmount === 0 ? null : expense <= budgetAmount,
      byCategory: [...byCategory.entries()]
        .map(([category, amount]) => ({
          category,
          amount: roundMoney(amount),
          percent: expense > 0 ? Math.round((amount / expense) * 100) : 0,
        }))
        .sort((a, b) => b.amount - a.amount),
      recent: serializeMany(rows.slice(0, 20)),
    };
  }
}

function roundMoney(value: number) {
  return Math.round(value * 100) / 100;
}
