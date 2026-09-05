export interface AuthUser {
  id: string;
  email: string;
  name: string;
}

export interface TodayHabit {
  id: string;
  name: string;
  lifeAreaId: string;
  target: number;
  unit: string;
  current: number;
  complete: boolean;
  missed: boolean;
  captureStyle: 'complete' | 'duration' | 'learning';
  actionLabel: string;
  color?: string;
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
  progress: { percent: number; completedHabits: number; totalHabits: number };
  habits: TodayHabit[];
  priorities: Array<{ id: string; title: string; priority: string; status: string }>;
  tasks: Array<{ id: string; title: string; status: string; dueDate?: string }>;
  journal: { exists: boolean; id?: string };
}

export interface FinanceSummary {
  month: string;
  from: string;
  to: string;
  income: number;
  expense: number;
  net: number;
  budget: number;
  remaining: number | null;
  percentUsed: number;
  onTrack: boolean | null;
  byCategory: Array<{ category: string; amount: number; percent: number }>;
  recent: FinanceTransaction[];
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

export const todayDate = () => new Date().toISOString().slice(0, 10);
export const currentMonth = () => new Date().toISOString().slice(0, 7);
