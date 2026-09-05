import { useQuery } from '@tanstack/react-query';
import { ScrollView, StyleSheet } from 'react-native';
import { api } from '../../api/client';
import { EmptyState, Fab, Group, Row, Screen } from '../../components/ui';
import { space } from '../../theme';

export function ListScreen({
  path,
  onPress,
}: {
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
    <Screen safe={false}>
      <ScrollView contentContainerStyle={styles.list}>
        {!query.data?.length ? <EmptyState title="Nothing here yet" body="Add only what you will use." /> : null}
        {query.data?.length ? (
          <Group>
            {query.data.map((item, index) => (
              <Row
                key={item.id}
                title={item.title ?? item.name ?? 'Untitled'}
                subtitle={item.status ? item.status.replace(/_/g, ' ') : undefined}
                value={typeof item.progress === 'number' ? `${item.progress}%` : undefined}
                onPress={onPress ? () => onPress(item) : undefined}
                last={index === query.data.length - 1}
              />
            ))}
          </Group>
        ) : null}
      </ScrollView>
    </Screen>
  );
}

export function GoalsScreen({ navigation }: { navigation: { navigate: (name: string, params?: object) => void } }) {
  return (
    <>
      <ListScreen path="/goals" onPress={(item) => navigation.navigate('GoalDetail', { id: item.id })} />
      <Fab onPress={() => navigation.navigate('CreateGoal')} />
    </>
  );
}

export function HabitsScreen({ navigation }: { navigation: { navigate: (name: string, params: object) => void } }) {
  return <ListScreen path="/habits" onPress={(item) => navigation.navigate('HabitDetail', { id: item.id })} />;
}

export function TasksScreen({ navigation }: { navigation: { navigate: (name: string) => void } }) {
  return (
    <>
      <ListScreen path="/tasks" />
      <Fab onPress={() => navigation.navigate('CreateTask')} />
    </>
  );
}

export function AchievementsScreen({ navigation }: { navigation: { navigate: (name: string) => void } }) {
  return (
    <>
      <ListScreen path="/achievements" />
      <Fab onPress={() => navigation.navigate('CreateAchievement')} />
    </>
  );
}

const styles = StyleSheet.create({
  list: { paddingVertical: space.md, gap: 16, paddingBottom: 88 },
});
