import { describe, expect, it } from 'vitest';

function aggregateHabitProgress(
  activities: Array<{ durationMinutes: number; status: string }>,
  unit: 'minutes' | 'completion',
) {
  if (unit === 'minutes') {
    return activities.reduce((sum, item) => sum + item.durationMinutes, 0);
  }
  return activities.filter((item) => item.status === 'completed' || item.status === 'partial').length;
}

describe('habit aggregation', () => {
  it('sums multiple skill activities on the same day', () => {
    const current = aggregateHabitProgress(
      [
        { durationMinutes: 45, status: 'completed' },
        { durationMinutes: 30, status: 'completed' },
      ],
      'minutes',
    );
    expect(current).toBe(75);
  });
});
