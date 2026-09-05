import { useQuery } from '@tanstack/react-query';
import { ScrollView, StyleSheet } from 'react-native';
import { api, useSession } from '../../api/client';
import { ErrorBanner, Group, HeaderButton, Row, Screen, ScreenHeader } from '../../components/ui';
import { money } from '../../theme';
import type { FinanceSummary, TodayPayload } from '../../types';
import { currentMonth, todayDate } from '../../types';

export function DashboardScreen({ navigation }: { navigation: { navigate: (name: string) => void } }) {
  const user = useSession((s) => s.user);
  const firstName = user?.name?.split(' ')[0] ?? 'there';
  const date = todayDate();
  const month = currentMonth();

  const today = useQuery({
    queryKey: ['today', date],
    queryFn: () => api<TodayPayload>(`/today?date=${date}`),
  });
  const analytics = useQuery({
    queryKey: ['analytics'],
    queryFn: () =>
      api<{
        doingWell: string | null;
        neglecting: string | null;
        taskCompletion: number;
        goalProgress: number;
        activeHabits: number;
        monthlyCompletion: { habitsCompleted: number; habitsMissed: number };
      }>('/analytics/dashboard'),
  });
  const goals = useQuery({
    queryKey: ['goals'],
    queryFn: () => api<Array<{ id: string; progress?: number }>>('/goals'),
  });
  const achievements = useQuery({
    queryKey: ['/achievements'],
    queryFn: () => api<Array<{ id: string; title: string; date?: string }>>('/achievements'),
  });
  const finance = useQuery({
    queryKey: ['finance-summary', month],
    queryFn: () => api<FinanceSummary>(`/finance/summary?month=${month}`),
  });
  const areas = useQuery({
    queryKey: ['document-counts'],
    queryFn: () => api<Array<{ _id: string; count: number }>>('/documents/counts'),
  });

  const year = today.data?.personalYear;
  const wins = analytics.data?.monthlyCompletion.habitsCompleted ?? 0;
  const misses = analytics.data?.monthlyCompletion.habitsMissed ?? 0;
  const notes = (areas.data ?? []).reduce((sum, row) => sum + (row.count ?? 0), 0);
  const latest = achievements.data?.[0];

  return (
    <Screen>
      <ScreenHeader
        kicker={new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
        title={`Hello, ${firstName}`}
        subtitle="Your life at a glance"
        right={<HeaderButton icon="search-outline" onPress={() => navigation.navigate('Search')} />}
      />
      {today.isError ? (
        <ErrorBanner
          message={today.error instanceof Error ? today.error.message : 'Could not load dashboard'}
          onRetry={() => today.refetch()}
        />
      ) : null}
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Group label="Progress">
          <Row
            icon="flag-outline"
            title="Personal year"
            subtitle={year ? `Day ${year.currentDay} of ${year.totalDays}` : 'Not set yet'}
            value={year ? `${year.percentComplete}%` : 'Set'}
            onPress={() => navigation.navigate(year ? 'PlanYear' : 'YearSetup')}
          />
          <Row
            icon="sunny-outline"
            title="Today"
            subtitle={`${today.data?.progress.completedHabits ?? 0} of ${today.data?.progress.totalHabits ?? 0} habits`}
            value={`${today.data?.progress.percent ?? 0}%`}
            onPress={() => navigation.navigate('TodayTab')}
          />
          <Row
            icon="checkmark-circle-outline"
            title="Wins this month"
            subtitle="Habits and activities completed"
            value={wins}
            tone="success"
            onPress={() => navigation.navigate('PlanMonth')}
          />
          <Row
            icon="close-circle-outline"
            title="Missed this month"
            subtitle="Left incomplete"
            value={misses}
            tone="danger"
            last
            onPress={() => navigation.navigate('PlanMonth')}
          />
        </Group>

        <Group label="Attention">
          <Row
            icon="trending-up-outline"
            title="Doing well"
            subtitle={analytics.data?.doingWell ?? 'Keep showing up'}
            tone="success"
            onPress={() => navigation.navigate('WeeklyReview')}
          />
          <Row
            icon="alert-circle-outline"
            title="Needs attention"
            subtitle={analytics.data?.neglecting ?? 'Nothing flagged'}
            tone="danger"
            last
            onPress={() => navigation.navigate('WeeklyReview')}
          />
        </Group>

        <Group label="You have now">
          <Row
            icon="repeat-outline"
            title="Habits"
            subtitle="Active routines"
            value={analytics.data?.activeHabits ?? 0}
            onPress={() => navigation.navigate('Habits')}
          />
          <Row
            icon="ribbon-outline"
            title="Goals"
            subtitle={`${goals.data?.length ?? 0} total`}
            value={`${Math.round(analytics.data?.goalProgress ?? 0)}%`}
            onPress={() => navigation.navigate('Goals')}
          />
          <Row
            icon="checkbox-outline"
            title="Tasks"
            subtitle="Completion"
            value={`${Math.round(analytics.data?.taskCompletion ?? 0)}%`}
            onPress={() => navigation.navigate('Tasks')}
          />
          <Row
            icon="book-outline"
            title="Notes"
            subtitle="Topic documents"
            value={notes}
            onPress={() => navigation.navigate('Knowledge')}
          />
          <Row
            icon="wallet-outline"
            title="Money this month"
            subtitle={finance.data?.budget ? `${money(finance.data.remaining ?? 0)} left` : 'No budget set'}
            value={money(finance.data?.expense ?? 0)}
            last
            onPress={() => navigation.navigate('MoneyTab')}
          />
        </Group>

        <Group label="Achievements">
          <Row
            icon="trophy-outline"
            title={latest?.title ?? 'No milestones yet'}
            subtitle={latest?.date ?? 'Log the ones that matter'}
            last
            onPress={() => navigation.navigate('Achievements')}
          />
        </Group>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { paddingBottom: 40, gap: 22, paddingTop: 8 },
});
