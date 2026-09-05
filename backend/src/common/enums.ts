export const HABIT_FREQUENCIES = ['daily', 'weekdays', 'weekly', 'monthly'] as const;
export type HabitFrequency = (typeof HABIT_FREQUENCIES)[number];

export const HABIT_UNITS = ['minutes', 'completion', 'count'] as const;
export type HabitUnit = (typeof HABIT_UNITS)[number];

export const CAPTURE_STYLES = ['complete', 'duration', 'learning'] as const;
export type CaptureStyle = (typeof CAPTURE_STYLES)[number];

export const ACTIVITY_STATUSES = [
  'completed',
  'partial',
  'missed',
  'skipped',
  'not_applicable',
] as const;
export type ActivityStatus = (typeof ACTIVITY_STATUSES)[number];

export const GOAL_PERIODS = ['annual', 'quarterly', 'monthly', 'weekly'] as const;
export type GoalPeriod = (typeof GOAL_PERIODS)[number];

export const GOAL_STATUSES = ['not_started', 'in_progress', 'completed', 'cancelled'] as const;
export type GoalStatus = (typeof GOAL_STATUSES)[number];

export const TASK_STATUSES = [
  'not_started',
  'in_progress',
  'completed',
  'cancelled',
  'deferred',
] as const;
export type TaskStatus = (typeof TASK_STATUSES)[number];

export const TASK_PRIORITIES = ['low', 'medium', 'high'] as const;
export type TaskPriority = (typeof TASK_PRIORITIES)[number];

export const SYNC_STATUSES = ['synced', 'pending', 'failed', 'conflict'] as const;
export type SyncStatus = (typeof SYNC_STATUSES)[number];

export const REVIEW_TYPES = ['weekly', 'monthly', 'yearly'] as const;
export type ReviewType = (typeof REVIEW_TYPES)[number];

export const FINANCE_TYPES = ['income', 'expense'] as const;
export type FinanceType = (typeof FINANCE_TYPES)[number];

export const EXPENSE_CATEGORIES = [
  'Food',
  'Transport',
  'Housing',
  'Health',
  'Learning',
  'Work',
  'Giving',
  'Fun',
  'Other',
] as const;
export type ExpenseCategory = (typeof EXPENSE_CATEGORIES)[number];

export const INCOME_CATEGORIES = ['Salary', 'Side', 'Gift', 'Other'] as const;
export type IncomeCategory = (typeof INCOME_CATEGORIES)[number];

export const FINANCE_CATEGORIES = [...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES] as const;
export type FinanceCategory = (typeof FINANCE_CATEGORIES)[number];
