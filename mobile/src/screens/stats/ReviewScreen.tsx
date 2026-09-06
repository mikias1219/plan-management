import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { api } from '../../api/client';
import { Field } from '../../components/Field';
import { Group, PrimaryButton, Row, Screen } from '../../components/ui';
import { space } from '../../theme';

export function ReviewScreen({ type }: { type: 'weekly' | 'monthly' | 'yearly' }) {
  const review = useQuery({
    queryKey: ['review', type],
    queryFn: () =>
      api<{
        periodStart: string;
        periodEnd: string;
        autoSummary: {
          habitsCompleted: number;
          habitsMissed: number;
          tasksCompleted: number;
          knowledgeCreated: number;
          strongestArea: string | null;
          weakestArea: string | null;
        };
      }>(`/reviews/${type}`),
  });
  const [wentWell, setWentWell] = useState('');
  const [shouldImprove, setImprove] = useState('');
  const summary = review.data?.autoSummary;

  return (
    <Screen safe={false}>
      <ScrollView contentContainerStyle={styles.content}>
        <Group label="This period">
          <Row title="Done" value={summary?.habitsCompleted ?? 0} tone="success" />
          <Row title="Missed" value={summary?.habitsMissed ?? 0} tone="danger" />
          <Row title="Tasks completed" value={summary?.tasksCompleted ?? 0} />
          <Row title="Notes created" value={summary?.knowledgeCreated ?? 0} last />
        </Group>
        <Group label="Focus">
          <Row icon="trending-up-outline" title="Strongest" subtitle={summary?.strongestArea ?? '—'} tone="success" />
          <Row icon="alert-circle-outline" title="Weakest" subtitle={summary?.weakestArea ?? '—'} tone="danger" last />
        </Group>
        <Field value={wentWell} onChangeText={setWentWell} placeholder="What went well?" multiline />
        <Field value={shouldImprove} onChangeText={setImprove} placeholder="What should improve next period?" multiline />
        <PrimaryButton
          label="Save reflection"
          onPress={() =>
            api(`/reviews/${type}`, {
              method: 'POST',
              body: JSON.stringify({ wentWell, shouldImprove }),
            })
          }
        />
      </ScrollView>
    </Screen>
  );
}

export function WeeklyReviewScreen() {
  return <ReviewScreen type="weekly" />;
}

export function MonthlyReviewScreen() {
  return <ReviewScreen type="monthly" />;
}

export function YearlyReviewScreen() {
  return <ReviewScreen type="yearly" />;
}

const styles = StyleSheet.create({
  content: { gap: space.md, paddingVertical: space.md, paddingBottom: 40 },
});
