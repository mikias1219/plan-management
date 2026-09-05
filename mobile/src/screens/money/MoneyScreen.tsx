import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Alert, ScrollView, StyleSheet } from 'react-native';
import { api } from '../../api/client';
import { ErrorBanner, Fab, Group, Row, Screen, ScreenHeader } from '../../components/ui';
import { money, monthLabel } from '../../theme';
import type { FinanceSummary } from '../../types';
import { currentMonth } from '../../types';

export function MoneyScreen({ navigation }: { navigation: { navigate: (name: string, params?: object) => void } }) {
  const month = currentMonth();
  const queryClient = useQueryClient();
  const summary = useQuery({
    queryKey: ['finance-summary', month],
    queryFn: () => api<FinanceSummary>(`/finance/summary?month=${month}`),
  });
  const data = summary.data;
  const over = data?.onTrack === false;

  const remove = useMutation({
    mutationFn: (id: string) => api(`/finance/transactions/${id}`, { method: 'DELETE' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['finance-summary'] }),
  });

  return (
    <Screen>
      <ScreenHeader title="Money" subtitle={monthLabel(month)} />
      {summary.isError ? (
        <ErrorBanner
          message={summary.error instanceof Error ? summary.error.message : 'Could not load money'}
          onRetry={() => summary.refetch()}
        />
      ) : null}
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Group label="This month">
          <Row
            icon="arrow-down-circle-outline"
            title="Spent"
            subtitle={data?.budget ? `of ${money(data.budget)} budget` : 'No budget yet'}
            value={money(data?.expense ?? 0)}
            tone={over ? 'danger' : 'accent'}
          />
          <Row icon="arrow-up-circle-outline" title="Income" value={money(data?.income ?? 0)} tone="success" />
          <Row
            icon="swap-vertical-outline"
            title="Net"
            value={money(data?.net ?? 0)}
            tone={(data?.net ?? 0) < 0 ? 'danger' : 'success'}
          />
          <Row
            icon="pie-chart-outline"
            title="Budget"
            subtitle={data?.budget ? (over ? 'Over cap' : `${money(data.remaining ?? 0)} remaining`) : 'Set a monthly cap'}
            value={data?.budget ? `${data.percentUsed}%` : 'Off'}
            last
            onPress={() => navigation.navigate('Budget')}
          />
        </Group>

        <Group label="Add">
          <Row
            icon="remove-circle-outline"
            title="Expense"
            subtitle="Food, transport, and the rest"
            tone="danger"
            onPress={() => navigation.navigate('AddTransaction', { type: 'expense' })}
          />
          <Row
            icon="add-circle-outline"
            title="Income"
            subtitle="Salary, side, gifts"
            tone="success"
            last
            onPress={() => navigation.navigate('AddTransaction', { type: 'income' })}
          />
        </Group>

        {data?.byCategory.length ? (
          <Group label="Where it went">
            {data.byCategory.map((row, index) => (
              <Row
                key={row.category}
                icon="ellipse"
                title={row.category}
                subtitle={`${row.percent}% of spending`}
                value={money(row.amount)}
                last={index === data.byCategory.length - 1}
              />
            ))}
          </Group>
        ) : null}

        <Group label="Recent">
          {!data?.recent.length ? (
            <Row icon="receipt-outline" title="No transactions yet" subtitle="Keep cashflow here, not in habits" last />
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
      <Fab onPress={() => navigation.navigate('AddTransaction', { type: 'expense' })} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { paddingTop: 8, paddingBottom: 120, gap: 22 },
});
