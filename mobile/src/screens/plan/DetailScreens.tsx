import { useQuery } from '@tanstack/react-query';
import { ScrollView, StyleSheet, Text } from 'react-native';
import { api } from '../../api/client';
import { Muted, ProgressBar, Screen, Title } from '../../components/ui';
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
    <Screen>
      <ScrollView contentContainerStyle={{ gap: space.md }}>
        <Title>{data?.title ?? 'Goal'}</Title>
        <Muted>{data ? `${data.period} · ${data.status.replace('_', ' ')}` : 'Loading…'}</Muted>
        <ProgressBar value={data?.progress ?? 0} />
        <Text>{data?.description}</Text>
        <Muted>
          {data ? `${data.currentValue} / ${data.target}` : ''}
        </Muted>
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
    <Screen>
      <Title>{habit.data?.name ?? 'Habit'}</Title>
      <Muted>
        {habit.data ? `${habit.data.frequency} · ${habit.data.target} ${habit.data.unit}` : ''}
      </Muted>
      <ScrollView style={{ marginTop: space.md }}>
        {history.data?.map((item) => (
          <Muted key={item.id}>{`${item.date} · ${item.title} · ${item.durationMinutes} min`}</Muted>
        ))}
      </ScrollView>
    </Screen>
  );
}
