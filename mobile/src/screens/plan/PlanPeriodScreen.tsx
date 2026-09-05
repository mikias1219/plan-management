import { useQuery } from '@tanstack/react-query';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { api } from '../../api/client';
import { EmptyState, Muted, Screen, Title } from '../../components/ui';
import { colors, radius, space } from '../../theme';

export function PlanPeriodScreen({
  view,
}: {
  view: 'day' | 'week' | 'month' | 'year';
}) {
  const query = useQuery({
    queryKey: ['plan', view],
    queryFn: () =>
      api<{
        view: string;
        from?: string;
        to?: string;
        date?: string;
        personalYear?: { currentDay: number; totalDays: number; percentComplete: number } | null;
        habits?: Array<{ id: string; name: string; current: number; target: number; complete: boolean }>;
        activities?: Array<{ id: string; date: string; title: string; durationMinutes: number }>;
        tasks?: Array<{ id: string; title: string; status: string }>;
        goals?: Array<{ id: string; title: string; progress: number }>;
      }>(`/plan?view=${view}`),
  });
  const data = query.data;
  const heading = view[0].toUpperCase() + view.slice(1);

  return (
    <Screen>
      <Title>{heading}</Title>
      {data?.from ? <Muted>{`${data.from} → ${data.to}`}</Muted> : null}
      {data?.personalYear ? (
        <Muted>{`Day ${data.personalYear.currentDay} of ${data.personalYear.totalDays} · ${data.personalYear.percentComplete}%`}</Muted>
      ) : null}
      <ScrollView contentContainerStyle={styles.list}>
        {data?.habits?.map((habit) => (
          <View key={habit.id} style={styles.row}>
            <Text style={styles.name}>{habit.name}</Text>
            <Muted>{habit.complete ? 'Done' : `${habit.current} / ${habit.target}`}</Muted>
          </View>
        ))}
        {data?.activities?.map((item) => (
          <View key={item.id} style={styles.row}>
            <Text style={styles.name}>{item.title}</Text>
            <Muted>{`${item.date} · ${item.durationMinutes} min`}</Muted>
          </View>
        ))}
        {data?.tasks?.map((item) => (
          <View key={item.id} style={styles.row}>
            <Text style={styles.name}>{item.title}</Text>
            <Muted>{item.status.replace('_', ' ')}</Muted>
          </View>
        ))}
        {data?.goals?.map((item) => (
          <View key={item.id} style={styles.row}>
            <Text style={styles.name}>{item.title}</Text>
            <Muted>{`${item.progress}%`}</Muted>
          </View>
        ))}
        {!data?.habits?.length && !data?.activities?.length && !data?.tasks?.length ? (
          <EmptyState title={`Nothing in this ${view} yet`} body="Record from Today or Quick add." />
        ) : null}
      </ScrollView>
    </Screen>
  );
}

export function PlanDayScreen() {
  return <PlanPeriodScreen view="day" />;
}
export function PlanWeekScreen() {
  return <PlanPeriodScreen view="week" />;
}
export function PlanMonthScreen() {
  return <PlanPeriodScreen view="month" />;
}
export function PlanYearScreen() {
  return <PlanPeriodScreen view="year" />;
}

const styles = StyleSheet.create({
  list: { gap: 10, paddingVertical: space.md, paddingBottom: 40 },
  row: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius,
    padding: space.md,
  },
  name: { fontSize: 16, fontWeight: '600', color: colors.text },
});
