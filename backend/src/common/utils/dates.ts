const DAY_MS = 86_400_000;

export function toDateString(date: Date, timeZone = 'UTC'): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
}

export function parseDateString(value: string): Date {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}

export function diffUtcDays(start: string, end: string): number {
  return Math.round((parseDateString(end).getTime() - parseDateString(start).getTime()) / DAY_MS);
}

export function addUtcDays(start: string, days: number): string {
  const next = new Date(parseDateString(start).getTime() + days * DAY_MS);
  return toDateString(next, 'UTC');
}

export function weekdayUtc(date: string): number {
  return parseDateString(date).getUTCDay();
}

export function startOfWeek(date: string): string {
  const day = weekdayUtc(date);
  const mondayOffset = day === 0 ? -6 : 1 - day;
  return addUtcDays(date, mondayOffset);
}

export function endOfWeek(date: string): string {
  return addUtcDays(startOfWeek(date), 6);
}

export function startOfMonth(date: string): string {
  return `${date.slice(0, 7)}-01`;
}

export function endOfMonth(date: string): string {
  const [year, month] = date.split('-').map(Number);
  const last = new Date(Date.UTC(year, month, 0));
  return toDateString(last, 'UTC');
}

export interface PersonalYearProgress {
  currentDay: number;
  totalDays: number;
  daysCompleted: number;
  daysRemaining: number;
  percentComplete: number;
  inRange: boolean;
}

export function calculatePersonalYearProgress(
  startDate: string,
  endDate: string,
  today: string,
): PersonalYearProgress {
  const totalDays = diffUtcDays(startDate, endDate) + 1;
  const rawDay = diffUtcDays(startDate, today) + 1;
  const inRange = rawDay >= 1 && rawDay <= totalDays;
  const currentDay = Math.min(Math.max(rawDay, 0), totalDays);
  const daysCompleted = inRange ? Math.max(currentDay - 1, 0) : rawDay > totalDays ? totalDays : 0;
  const daysRemaining = Math.max(totalDays - currentDay, 0);
  const percentComplete = totalDays <= 0 ? 0 : Math.min(100, Math.round((currentDay / totalDays) * 1000) / 10);

  return {
    currentDay,
    totalDays,
    daysCompleted,
    daysRemaining,
    percentComplete,
    inRange,
  };
}

export function isHabitDueOnDate(input: {
  frequency: 'daily' | 'weekdays' | 'weekly' | 'monthly';
  selectedDays?: number[];
  startDate?: string;
  endDate?: string;
  date: string;
}): boolean {
  const { frequency, selectedDays, startDate, endDate, date } = input;
  if (startDate && date < startDate) {
    return false;
  }
  if (endDate && date > endDate) {
    return false;
  }

  if (frequency === 'daily') {
    return true;
  }

  if (frequency === 'weekdays') {
    const days = selectedDays?.length ? selectedDays : [1, 2, 3, 4, 5];
    return days.includes(weekdayUtc(date));
  }

  if (frequency === 'weekly') {
    return weekdayUtc(date) === (selectedDays?.[0] ?? 1);
  }

  return date.endsWith('-01') || (selectedDays?.[0] != null && Number(date.slice(8, 10)) === selectedDays[0]);
}
