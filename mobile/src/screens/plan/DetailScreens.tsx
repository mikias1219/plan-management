import { useQuery } from '@tanstack/react-query';
import { ScrollView, StyleSheet } from 'react-native';
import { api } from '../../api/client';
import { Group, ProgressBar, Row, Screen } from '../../components/ui';
import { space } from '../../theme';

export function GoalDetailScreen({ route }: { route: { params: { id: string } } }) {
  const goal = useQuery({
    queryKey: ['goal', route.params.id],
    queryFn: () =>
      api<{ title: string; description: string; period: string; progress: number; status: string; target: number; currentValue: number }>(
        `/goals/${route.params.id}`,
      ),
  });
  const data = goal.data;
  return (
    <Screen safe={false}>
      <ScrollView contentContainerStyle={styles.list}>
        <Group>
          <Row title="Period" value={data?.period} />
          <Row title="Status" value={data?.status?.replace(/_/g, ' ')} />
          <Row title="Progress" value={data ? `${data.progress}%` : '—'} />
          <Row title="Current" value={data ? `${data.currentValue} / ${data.target}` : '—'} last />
        </Group>
        {typeof data?.progress === 'number' ? <ProgressBar value={data.progress} /> : null}
      </ScrollView>
    </Screen>
  );
}

export function HabitDetailScreen({ route }: { route: { params: { id: string } } }) {
  const habit = useQuery({
    queryKey: ['habit', route.params.id],
    queryFn: () =>
      api<{ name: string; description: string; frequency: string; target: number; unit: string }>(`/habits/${route.params.id}`),
  });
  const history = useQuery({
    queryKey: ['habit-history', route.params.id],
    queryFn: () => api<Array<{ id: string; date: string; title: string; durationMinutes: number }>>(`/activities?habitId=${route.params.id}`),
  });
  return (
    <Screen safe={false}>
      <ScrollView contentContainerStyle={styles.list}>
        <Group>
          <Row title="Frequency" value={habit.data?.frequency} />
          <Row title="Target" value={habit.data ? `${habit.data.target} ${habit.data.unit}` : undefined} last />
        </Group>
        <Group label="History">
          {(history.data ?? []).map((item, index) => (
            <Row
              key={item.id}
              title={item.title}
              subtitle={`${item.date} · ${item.durationMinutes} min`}
              last={index === (history.data?.length ?? 1) - 1}
            />
          ))}
        </Group>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: { gap: 22, paddingVertical: space.md, paddingBottom: 40 },
});
