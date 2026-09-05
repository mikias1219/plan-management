import { useQuery } from '@tanstack/react-query';
import { ScrollView, StyleSheet } from 'react-native';
import { api } from '../../api/client';
import { Group, Row, Screen, ScreenHeader } from '../../components/ui';
import type { TodayPayload } from '../../types';
import { todayDate } from '../../types';

export function PlanScreen({ navigation }: { navigation: { navigate: (name: string) => void } }) {
  const today = useQuery({
    queryKey: ['today', todayDate()],
    queryFn: () => api<TodayPayload>(`/today?date=${todayDate()}`),
  });
  const year = today.data?.personalYear;
  const goals = useQuery({
    queryKey: ['goals'],
    queryFn: () => api<Array<{ id: string; progress?: number }>>('/goals'),
  });
  const goalPct = goals.data?.length
    ? Math.round(goals.data.reduce((sum, g) => sum + (g.progress ?? 0), 0) / goals.data.length)
    : 0;

  return (
    <Screen>
      <ScreenHeader title="Plan" subtitle="One thing at a time" />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Group label="Time">
          <Row
            icon="flag-outline"
            title="Personal year"
            subtitle={year ? `${year.daysRemaining} days left` : 'Set start and end dates'}
            value={year ? `${year.percentComplete}%` : undefined}
            onPress={() => navigation.navigate(year ? 'PlanYear' : 'YearSetup')}
          />
          <Row icon="today-outline" title="This week" subtitle="Habits and tasks" onPress={() => navigation.navigate('PlanWeek')} />
          <Row
            icon="calendar-outline"
            title="This month"
            subtitle="A wider look"
            last
            onPress={() => navigation.navigate('PlanMonth')}
          />
        </Group>

        <Group label="Building">
          <Row
            icon="ribbon-outline"
            title="Goals"
            subtitle="Annual down to weekly"
            value={`${goalPct}%`}
            onPress={() => navigation.navigate('Goals')}
          />
          <Row icon="repeat-outline" title="Habits" subtitle="Recurring behaviors" onPress={() => navigation.navigate('Habits')} />
          <Row
            icon="checkbox-outline"
            title="Tasks"
            subtitle="Specific actions"
            last
            onPress={() => navigation.navigate('Tasks')}
          />
        </Group>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { paddingTop: 8, paddingBottom: 40, gap: 22 },
});
