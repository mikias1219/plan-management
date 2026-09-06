import { useQuery } from '@tanstack/react-query';
import { ScrollView, StyleSheet } from 'react-native';
import { api } from '../../api/client';
import { EmptyState, Group, InsightCard, Row, Screen } from '../../components/ui';
import { space } from '../../theme';
import type { DayItem } from '../../types';
import { unitLabel } from '../../types';

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
        progress?: { percent: number; completed: number; total: number };
        items?: DayItem[];
        tasks?: Array<{ id: string; title: string; status: string }>;
        goals?: Array<{ id: string; title: string; progress: number }>;
      }>(`/plan?view=${view}`),
  });
  const data = query.data;
  const empty = !data?.items?.length && !data?.tasks?.length && !data?.goals?.length;

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

        {typeof data?.progress?.total === 'number' ? (
          <InsightCard
            icon="checkbox-outline"
            title="Plan progress"
            body={`${data.progress.completed} of ${data.progress.total} items done`}
            progress={data.progress.percent}
            value={`${data.progress.percent}%`}
          />
        ) : null}

        {data?.items?.length ? (
          <Group label="Day plan">
            {data.items.map((item, index) => (
              <Row
                key={item.id}
                icon={item.status === 'done' ? 'checkmark-circle-outline' : item.status === 'missed' ? 'close-circle-outline' : 'ellipse-outline'}
                tone={item.status === 'done' ? 'success' : item.status === 'missed' ? 'danger' : 'neutral'}
                title={item.title}
                subtitle={`${item.target} ${unitLabel(item.unit)}${item.date ? ` · ${item.date}` : ''}`}
                value={item.status}
                last={index === data.items!.length - 1}
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

        {empty ? <EmptyState title={`Nothing in this ${view} yet`} body="Add plan items from Today." /> : null}
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
