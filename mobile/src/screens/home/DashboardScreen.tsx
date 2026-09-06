import { useQuery } from '@tanstack/react-query';
import { ScrollView, StyleSheet, View } from 'react-native';
import { api, useSession } from '../../api/client';
import {
  ErrorBanner,
  HeaderButton,
  InsightCard,
  MetricTile,
  Screen,
  ScreenHeader,
  SectionLabel,
} from '../../components/ui';
import { money, space } from '../../theme';
import type { AnalyticsDashboard, FinanceSummary, TodayPayload } from '../../types';
import { currentMonth, todayDate } from '../../types';

export function DashboardScreen({ navigation }: { navigation: { navigate: (name: string, params?: object) => void } }) {
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
    queryFn: () => api<AnalyticsDashboard>('/analytics/dashboard'),
  });
  const finance = useQuery({
    queryKey: ['finance-summary', 'month', month],
    queryFn: () => api<FinanceSummary>(`/finance/summary?period=month&month=${month}`),
  });
  const areas = useQuery({
    queryKey: ['document-counts'],
    queryFn: () => api<Array<{ _id: string; count: number }>>('/documents/counts'),
  });

  const year = today.data?.personalYear;
  const notes = (areas.data ?? []).reduce((sum, row) => sum + (row.count ?? 0), 0);
  const insights = analytics.data?.insights ?? [];
  const budgetAlert =
    finance.data?.budget && finance.data.percentUsed >= 80
      ? {
          title:
            finance.data.percentUsed >= 100
              ? 'Monthly budget used up'
              : `${finance.data.percentUsed}% of budget used`,
          body: finance.data.topCategory
            ? `Top spend: ${finance.data.topCategory.category}`
            : `${money(finance.data.remaining ?? 0)} left this month`,
          tone: finance.data.percentUsed >= 100 ? ('danger' as const) : ('warning' as const),
        }
      : null;

  function goInsight(action?: string) {
    if (!action) return;
    navigation.navigate(action);
  }

  return (
    <Screen>
      <ScreenHeader
        kicker={new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
        title={`Hi, ${firstName}`}
        subtitle="Your day at a glance"
        right={
          <View style={styles.headerActions}>
            <HeaderButton icon="search-outline" onPress={() => navigation.navigate('Search')} />
            <HeaderButton icon="person-circle-outline" onPress={() => navigation.navigate('Profile')} />
          </View>
        }
      />
      {today.isError ? (
        <ErrorBanner
          message={today.error instanceof Error ? today.error.message : 'Could not load home'}
          onRetry={() => today.refetch()}
        />
      ) : null}

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <SectionLabel>Today</SectionLabel>
        <InsightCard
          icon="sunny-outline"
          title="Daily plan"
          body={`${today.data?.progress.completed ?? 0} of ${today.data?.progress.total ?? 0} items done`}
          progress={today.data?.progress.percent ?? 0}
          value={`${today.data?.progress.percent ?? 0}%`}
          onPress={() => navigation.navigate('TodayTab')}
        />

        <View style={styles.metrics}>
          <MetricTile
            label="Year"
            value={year ? `${year.percentComplete}%` : 'Set up'}
            hint={year ? `Day ${year.currentDay}` : 'Personal year'}
            onPress={() => navigation.navigate(year ? 'PlanYear' : 'YearSetup')}
          />
          <MetricTile
            label="Goals"
            value={`${Math.round(analytics.data?.goalProgress ?? 0)}%`}
            hint={`${analytics.data?.goalsCount ?? 0} active`}
            onPress={() => navigation.navigate('Goals')}
          />
        </View>
        <View style={styles.metrics}>
          <MetricTile
            label="Money"
            value={money(finance.data?.expense ?? 0)}
            hint={finance.data?.budget ? `${finance.data.percentUsed}% of budget` : 'This month spent'}
            onPress={() => navigation.navigate('MoneyTab')}
          />
          <MetricTile
            label="Notes"
            value={notes}
            hint="Learning docs"
            onPress={() => navigation.navigate('LearnTab')}
          />
        </View>

        <SectionLabel>Helpful now</SectionLabel>
        {budgetAlert ? (
          <InsightCard
            icon="wallet-outline"
            title={budgetAlert.title}
            body={budgetAlert.body}
            progress={finance.data?.percentUsed}
            tone={budgetAlert.tone}
            onPress={() => navigation.navigate('MoneyTab')}
          />
        ) : null}
        {insights.length ? (
          insights.slice(0, 4).map((item) => (
            <InsightCard
              key={item.id}
              icon={
                item.tone === 'danger'
                  ? 'alert-circle-outline'
                  : item.tone === 'warning'
                    ? 'warning-outline'
                    : item.tone === 'success'
                      ? 'checkmark-circle-outline'
                      : 'bulb-outline'
              }
              title={item.title}
              body={item.body}
              tone={item.tone}
              onPress={() => goInsight(item.action)}
            />
          ))
        ) : (
          <InsightCard
            icon="sparkles-outline"
            title="You're all set"
            body="Complete a habit or add an expense to see live insights."
            tone="info"
            onPress={() => navigation.navigate('TodayTab')}
          />
        )}

        <SectionLabel>Continue</SectionLabel>
        <InsightCard
          icon="create-outline"
          title={today.data?.journal.exists ? 'Journal saved today' : 'Write a short reflection'}
          body="Optional — close the day in your own words."
          onPress={() => navigation.navigate('Journal')}
        />
        <InsightCard
          icon="add-circle-outline"
          title="Plan today"
          body="Add push-ups, squats, study blocks — then check them off."
          onPress={() => navigation.navigate('AddDayItem', { date })}
        />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { paddingBottom: 40, gap: 12, paddingTop: 8 },
  headerActions: { flexDirection: 'row', gap: 8 },
  metrics: { flexDirection: 'row', gap: 10 },
});
