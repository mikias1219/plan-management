import { useQuery } from '@tanstack/react-query';
import { ScrollView, StyleSheet } from 'react-native';
import { api } from '../../api/client';
import { EmptyState, Group, Row, Screen } from '../../components/ui';
import { space } from '../../theme';

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
  const empty = !data?.habits?.length && !data?.activities?.length && !data?.tasks?.length && !data?.goals?.length;

  return (
    <Screen safe={false}>
      <ScrollView contentContainerStyle={styles.list}>
        {data?.personalYear ? (
          <Group label="Year">
            <Row
              icon="flag-outline"
              title={`Day ${data.personalYear.currentDay} of ${data.personalYear.totalDays}`}
              value={`${data.personalYear.percentComplete}%`}
              last
            />
          </Group>
        ) : null}

        {data?.habits?.length ? (
          <Group label="Habits">
            {data.habits.map((habit, index) => (
              <Row
                key={habit.id}
                icon={habit.complete ? 'checkmark-circle-outline' : 'ellipse-outline'}
                tone={habit.complete ? 'success' : 'neutral'}
                title={habit.name}
                subtitle={habit.complete ? 'Done' : `${habit.current} / ${habit.target}`}
                last={index === data.habits!.length - 1}
              />
            ))}
          </Group>
        ) : null}

        {data?.goals?.length ? (
          <Group label="Goals">
            {data.goals.map((item, index) => (
              <Row
                key={item.id}
                icon="ribbon-outline"
                title={item.title}
                value={`${item.progress}%`}
                last={index === data.goals!.length - 1}
              />
            ))}
          </Group>
        ) : null}

        {data?.tasks?.length ? (
          <Group label="Tasks">
            {data.tasks.map((item, index) => (
              <Row
                key={item.id}
                icon="checkbox-outline"
                title={item.title}
                subtitle={item.status.replace(/_/g, ' ')}
                last={index === data.tasks!.length - 1}
              />
            ))}
          </Group>
        ) : null}

        {data?.activities?.length ? (
          <Group label="Logged">
            {data.activities.map((item, index) => (
              <Row
                key={item.id}
                icon="time-outline"
                title={item.title}
                subtitle={`${item.date} · ${item.durationMinutes} min`}
                last={index === data.activities!.length - 1}
              />
            ))}
          </Group>
        ) : null}

        {empty ? <EmptyState title={`Nothing in this ${view} yet`} body="Record from Today or Quick add." /> : null}
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
  list: { gap: 22, paddingVertical: space.md, paddingBottom: 40 },
});
