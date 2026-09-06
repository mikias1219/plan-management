import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { api } from '../../api/client';
import { PeriodFilter } from '../../components/DateTimeFields';
import {
  ErrorBanner,
  Fab,
  Group,
  InsightCard,
  MetricTile,
  Row,
  Screen,
  ScreenHeader,
  SectionLabel,
} from '../../components/ui';
import { colors, money, monthLabel } from '../../theme';
import type { FinancePeriod, FinanceSummary } from '../../types';
import { todayDate } from '../../types';

function periodLabel(period: FinancePeriod, from: string, to: string) {
  if (period === 'day') {
    return new Date(`${from}T00:00:00`).toLocaleDateString(undefined, {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
    });
  }
  if (period === 'week') {
    const a = new Date(`${from}T00:00:00`).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    const b = new Date(`${to}T00:00:00`).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    return `${a} – ${b}`;
  }
  return monthLabel(from.slice(0, 7));
}

export function MoneyScreen({ navigation }: { navigation: { navigate: (name: string, params?: object) => void } }) {
  const [period, setPeriod] = useState<FinancePeriod>('day');
  const [date, setDate] = useState(todayDate());
  const queryClient = useQueryClient();
  const month = date.slice(0, 7);

  const summary = useQuery({
    queryKey: ['finance-summary', period, date],
    queryFn: () =>
      api<FinanceSummary>(
        period === 'month'
          ? `/finance/summary?period=month&month=${month}`
          : `/finance/summary?period=${period}&date=${date}`,
      ),
  });

  const data = summary.data;
  const over = data?.onTrack === false;

  const remove = useMutation({
    mutationFn: (id: string) => api(`/finance/transactions/${id}`, { method: 'DELETE' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['finance-summary'] }),
  });

  return (
    <Screen>
      <ScreenHeader title="Money" subtitle="Pick a day, week, or month" />
      <PeriodFilter period={period} onPeriodChange={setPeriod} date={date} onDateChange={setDate} />
      {summary.isError ? (
        <ErrorBanner
          message={summary.error instanceof Error ? summary.error.message : 'Could not load money'}
          onRetry={() => summary.refetch()}
        />
      ) : null}

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.range}>{data ? periodLabel(period, data.from, data.to) : '…'}</Text>

        <InsightCard
          icon="wallet-outline"
          title="Spent"
          body={
            data?.budget
              ? `${money(data.remaining ?? 0)} left of ${money(data.budget)} this month`
              : 'Set a monthly budget to track progress'
          }
          value={money(data?.expense ?? 0)}
          progress={data?.budget ? data.percentUsed : undefined}
          tone={over ? 'danger' : 'info'}
          onPress={() => navigation.navigate('Budget')}
        />

        <View style={styles.metrics}>
          <MetricTile label="Income" value={money(data?.income ?? 0)} hint="In this period" />
          <MetricTile label="Net" value={money(data?.net ?? 0)} hint={(data?.net ?? 0) >= 0 ? 'Ahead' : 'Behind'} />
        </View>

        <Group label="Actions">
          <Row
            icon="remove-circle-outline"
            title="Add expense"
            tone="danger"
            onPress={() => navigation.navigate('AddTransaction', { type: 'expense', date })}
          />
          <Row
            icon="add-circle-outline"
            title="Add income"
            tone="success"
            onPress={() => navigation.navigate('AddTransaction', { type: 'income', date })}
          />
          <Row
            icon="pie-chart-outline"
            title="Monthly budget"
            subtitle={data?.budget ? money(data.budget) : 'Not set'}
            last
            onPress={() => navigation.navigate('Budget')}
          />
        </Group>

        {data?.byCategory.length ? (
          <>
            <SectionLabel>Where it went</SectionLabel>
            {data.byCategory.map((row) => (
              <InsightCard
                key={row.category}
                icon="ellipse"
                title={row.category}
                body={`${row.percent}% of spending`}
                value={money(row.amount)}
                progress={row.percent}
              />
            ))}
          </>
        ) : null}

        <Group label="Recent">
          {!data?.recent.length ? (
            <Row icon="receipt-outline" title="No transactions yet" subtitle="Add income or expense for this period" last />
          ) : (
            data.recent.map((item, index) => (
              <Row
                key={item.id}
                icon={item.type === 'income' ? 'arrow-up-outline' : 'arrow-down-outline'}
                tone={item.type === 'income' ? 'success' : 'neutral'}
                title={item.category}
                subtitle={item.note ? `${item.date} · ${item.note}` : item.date}
                value={`${item.type === 'income' ? '+' : '−'}${money(item.amount)}`}
                last={index === data.recent.length - 1}
                onPress={() =>
                  Alert.alert(item.category, item.note || money(item.amount), [
                    { text: 'Keep' },
                    { text: 'Delete', style: 'destructive', onPress: () => remove.mutate(item.id) },
                  ])
                }
              />
            ))
          )}
        </Group>
      </ScrollView>
      <Fab onPress={() => navigation.navigate('AddTransaction', { type: 'expense', date })} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { paddingTop: 14, paddingBottom: 120, gap: 12 },
  range: { color: colors.muted, fontSize: 14, fontWeight: '600' },
  metrics: { flexDirection: 'row', gap: 10 },
});
