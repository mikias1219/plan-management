import { useQuery } from '@tanstack/react-query';
import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';
import { api } from '../../api/client';
import { EmptyState, Screen, Title } from '../../components/ui';
import { colors, radius, space } from '../../theme';

export function ListScreen({
  title,
  path,
  onPress,
}: {
  title: string;
  path: string;
  onPress?: (item: { id: string }) => void;
}) {
  const query = useQuery({
    queryKey: [path],
    queryFn: async () => {
      const data = await api<unknown>(path);
      if (Array.isArray(data)) {
        return data as Array<{ id: string; title?: string; name?: string; status?: string; progress?: number }>;
      }
      if (data && typeof data === 'object' && 'data' in data) {
        return (data as { data: Array<{ id: string; title?: string; name?: string; status?: string; progress?: number }> }).data;
      }
      return [];
    },
  });

  return (
    <Screen>
      <Title>{title}</Title>
      <ScrollView contentContainerStyle={styles.list}>
        {!query.data?.length ? <EmptyState title={`No ${title.toLowerCase()} yet`} body="Keep it simple. Add only what you will use." /> : null}
        {query.data?.map((item) => (
          <Pressable key={item.id} onPress={() => onPress?.(item)} style={styles.row}>
            <Text style={styles.name}>{item.title ?? item.name}</Text>
            {item.status ? <Text style={styles.meta}>{item.status.replace('_', ' ')}</Text> : null}
          </Pressable>
        ))}
      </ScrollView>
    </Screen>
  );
}

export function GoalsScreen({ navigation }: { navigation: { navigate: (name: string, params?: object) => void } }) {
  return (
    <>
      <ListScreen title="Goals" path="/goals" onPress={(item) => navigation.navigate('GoalDetail', { id: item.id })} />
      <Pressable onPress={() => navigation.navigate('CreateGoal')} style={styles.fab}>
        <Text style={styles.fabLabel}>New goal</Text>
      </Pressable>
    </>
  );
}

export function HabitsScreen({ navigation }: { navigation: { navigate: (name: string, params: object) => void } }) {
  return <ListScreen title="Habits" path="/habits" onPress={(item) => navigation.navigate('HabitDetail', { id: item.id })} />;
}

export function TasksScreen({ navigation }: { navigation: { navigate: (name: string) => void } }) {
  return (
    <>
      <ListScreen title="Tasks" path="/tasks" />
      <Pressable onPress={() => navigation.navigate('CreateTask')} style={styles.fab}>
        <Text style={styles.fabLabel}>New task</Text>
      </Pressable>
    </>
  );
}

export function AchievementsScreen({ navigation }: { navigation: { navigate: (name: string) => void } }) {
  return (
    <>
      <ListScreen title="Achievements" path="/achievements" />
      <Pressable onPress={() => navigation.navigate('CreateAchievement')} style={styles.fab}>
        <Text style={styles.fabLabel}>New achievement</Text>
      </Pressable>
    </>
  );
}

const styles = StyleSheet.create({
  list: { paddingVertical: space.md, gap: 10, paddingBottom: 40 },
  row: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius,
    padding: space.md,
  },
  name: { fontSize: 16, fontWeight: '600', color: colors.text },
  meta: { color: colors.muted, marginTop: 4, textTransform: 'capitalize' },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 24,
    backgroundColor: colors.accent,
    borderRadius: radius,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  fabLabel: { color: '#fff', fontWeight: '600' },
});
