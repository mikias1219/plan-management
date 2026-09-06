export interface AuthUser {
  id: string;
  email: string;
  name: string;
}

export type DayItemStatus = 'planned' | 'done' | 'missed';
export type DayItemUnit = 'reps' | 'minutes' | 'count';

export interface DayItem {
  id: string;
  date: string;
  title: string;
  target: number;
  unit: DayItemUnit;
  plannedTime?: string;
  status: DayItemStatus;
  note: string;
}

export interface TodayPayload {
  date: string;
  greeting: string;
  personalYear: {
    id: string;
    startDate: string;
    endDate: string;
    currentDay: number;
    totalDays: number;
    daysCompleted: number;
    daysRemaining: number;
    percentComplete: number;
  } | null;
  progress: {
    percent: number;
    completed: number;
    total: number;
    planned: number;
    missed: number;
  };
  items: DayItem[];
  tasks: Array<{ id: string; title: string; status: string; dueDate?: string }>;
  journal: { exists: boolean; id?: string };
}

export type FinancePeriod = 'day' | 'week' | 'month';

export interface FinanceSummary {
  period: FinancePeriod;
  month: string;
  from: string;
  to: string;
  income: number;
  expense: number;
  net: number;
  budget: number;
  remaining: number | null;
  percentUsed: number;
  monthExpense?: number;
  onTrack: boolean | null;
  topCategory: { category: string; amount: number } | null;
  byCategory: Array<{ category: string; amount: number; percent: number }>;
  byDay?: Array<{ date: string; income: number; expense: number; net: number }>;
  recent: FinanceTransaction[];
  count?: number;
}

export interface FinanceTransaction {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  category: string;
  note: string;
  date: string;
  currency: string;
}

export interface DashboardInsight {
  id: string;
  tone: 'info' | 'success' | 'warning' | 'danger';
  title: string;
  body: string;
  action?: string;
}

export interface AnalyticsDashboard {
  doingWell: string | null;
  neglecting: string | null;
  taskCompletion: number;
  goalProgress: number;
  activeHabits: number;
  openTasks?: number;
  overdueTasks?: number;
  goalsCount?: number;
  insights?: DashboardInsight[];
  monthlyCompletion: { habitsCompleted: number; habitsMissed: number; knowledgeCreated?: number };
  timeDistribution: Array<{ name: string; minutes: number }>;
}

export const todayDate = () => new Date().toISOString().slice(0, 10);
export const currentMonth = () => new Date().toISOString().slice(0, 7);

export function unitLabel(unit: DayItemUnit) {
  if (unit === 'minutes') return 'min';
  if (unit === 'count') return 'x';
  return 'reps';
}
