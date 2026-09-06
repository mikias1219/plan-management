import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text } from 'react-native';
import { api } from '../../api/client';
import { PeriodFilter } from '../../components/DateTimeFields';
import {
  EmptyState,
  ErrorBanner,
  Fab,
  Group,
  InsightCard,
  Row,
  Screen,
  ScreenHeader,
} from '../../components/ui';
import { colors } from '../../theme';
import type { DayItem } from '../../types';
import { todayDate, unitLabel } from '../../types';

type PlanView = 'day' | 'week' | 'month';

type PlanPayload = {
  view: string;
  from?: string;
  to?: string;
  date?: string;
  personalYear?: { currentDay: number; totalDays: number; percentComplete: number; daysRemaining: number } | null;
  progress?: { percent: number; completed: number; total: number };
  items?: DayItem[];
  tasks?: Array<{ id: string; title: string; status: string }>;
  goals?: Array<{ id: string; title: string; progress: number }>;
};

function rangeLabel(view: PlanView, from?: string, to?: string, date?: string) {
  if (view === 'day' && date) {
    return new Date(`${date}T00:00:00`).toLocaleDateString(undefined, {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
    });
  }
  if (from && to) {
    const a = new Date(`${from}T00:00:00`).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    const b = new Date(`${to}T00:00:00`).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    return `${a} – ${b}`;
  }
  return '…';
}

export function PlanScreen({ navigation }: { navigation: { navigate: (name: string, params?: object) => void } }) {
  const [period, setPeriod] = useState<PlanView>('week');
  const [date, setDate] = useState(todayDate());

  const plan = useQuery({
    queryKey: ['plan', period, date],
    queryFn: () => api<PlanPayload>(`/plan?view=${period}&date=${date}`),
  });
  const data = plan.data;
  const items = data?.items ?? [];

  return (
    <Screen>
      <ScreenHeader title="Plan" subtitle="Day, week, or month — same list" />
      <PeriodFilter period={period} onPeriodChange={setPeriod} date={date} onDateChange={setDate} />
      {plan.isError ? (
        <ErrorBanner
          message={plan.error instanceof Error ? plan.error.message : 'Could not load plan'}
          onRetry={() => plan.refetch()}
        />
      ) : null}

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.range}>{rangeLabel(period, data?.from, data?.to, data?.date ?? date)}</Text>

        <InsightCard
          icon="checkbox-outline"
          title="Plan progress"
          body={`${data?.progress?.completed ?? 0} of ${data?.progress?.total ?? 0} items done`}
          progress={data?.progress?.percent ?? 0}
          value={`${data?.progress?.percent ?? 0}%`}
        />

        <Group label="Setup">
          <Row
            icon="flag-outline"
            title="Personal year"
            subtitle={
              data?.personalYear
                ? `${data.personalYear.daysRemaining} days left`
                : 'Set your year start'
            }
            value={data?.personalYear ? `${data.personalYear.percentComplete}%` : undefined}
            onPress={() => navigation.navigate(data?.personalYear ? 'PlanYear' : 'YearSetup')}
          />
          <Row
            icon="ribbon-outline"
            title="Goals"
            subtitle="Longer targets"
            onPress={() => navigation.navigate('Goals')}
          />
          <Row
            icon="checkbox-outline"
            title="Tasks"
            subtitle="One-time actions"
            last
            onPress={() => navigation.navigate('Tasks')}
          />
        </Group>

        {items.length ? (
          <Group label="Planned items">
            {items.map((item, index) => (
              <Row
                key={item.id}
                icon={
                  item.status === 'done'
                    ? 'checkmark-circle-outline'
                    : item.status === 'missed'
                      ? 'close-circle-outline'
                      : 'ellipse-outline'
                }
                tone={item.status === 'done' ? 'success' : item.status === 'missed' ? 'danger' : 'neutral'}
                title={item.title}
                subtitle={`${item.target} ${unitLabel(item.unit)}${period !== 'day' ? ` · ${item.date}` : ''}${
                  item.plannedTime ? ` · ${item.plannedTime}` : ''
                }`}
                value={item.status}
                last={index === items.length - 1}
                onPress={() => navigation.navigate('TodayTab')}
              />
            ))}
          </Group>
        ) : (
          <EmptyState
            title={`Nothing in this ${period} yet`}
            body="Add items on Today — like 30 push-ups — then check them off later."
          />
        )}

        {(data?.goals?.length || data?.tasks?.length) && period !== 'day' ? (
          <Group label="Also in range">
            {(data.goals ?? []).slice(0, 3).map((goal) => (
              <Row
                key={goal.id}
                icon="ribbon-outline"
                title={goal.title}
                value={`${goal.progress}%`}
                onPress={() => navigation.navigate('GoalDetail', { id: goal.id })}
              />
            ))}
            {(data.tasks ?? []).slice(0, 5).map((task, index, arr) => (
              <Row
                key={task.id}
                icon="checkbox-outline"
                title={task.title}
                subtitle={task.status.replace(/_/g, ' ')}
                last={index === arr.length - 1 && !(data.goals?.length)}
              />
            ))}
          </Group>
        ) : null}
      </ScrollView>
      <Fab onPress={() => navigation.navigate('AddDayItem', { date })} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { paddingTop: 14, paddingBottom: 120, gap: 12 },
  range: { color: colors.muted, fontSize: 14, fontWeight: '600' },
});
