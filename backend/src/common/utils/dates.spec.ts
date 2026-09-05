import { describe, expect, it } from 'vitest';
import { calculatePersonalYearProgress, isHabitDueOnDate } from './dates.js';

describe('calculatePersonalYearProgress', () => {
  it('treats the start date as day 1', () => {
    const progress = calculatePersonalYearProgress('2026-09-11', '2027-09-10', '2026-09-11');
    expect(progress.currentDay).toBe(1);
    expect(progress.totalDays).toBe(365);
    expect(progress.daysCompleted).toBe(0);
    expect(progress.daysRemaining).toBe(364);
    expect(progress.inRange).toBe(true);
  });

  it('advances the current day and remaining count', () => {
    const progress = calculatePersonalYearProgress('2026-09-11', '2027-09-10', '2026-09-12');
    expect(progress.currentDay).toBe(2);
    expect(progress.daysCompleted).toBe(1);
    expect(progress.daysRemaining).toBe(363);
  });
});

describe('isHabitDueOnDate', () => {
  it('marks weekday habits due Monday-Friday', () => {
    expect(isHabitDueOnDate({ frequency: 'weekdays', date: '2026-09-11' })).toBe(true);
    expect(isHabitDueOnDate({ frequency: 'weekdays', date: '2026-09-12' })).toBe(false);
  });
});
