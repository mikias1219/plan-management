import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text } from 'react-native';
import { api } from '../../api/client';
import { Field } from '../../components/Field';
import { Muted, PrimaryButton, Screen, Title } from '../../components/ui';
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
    <Screen>
      <Title>{type === 'weekly' ? 'Weekly review' : type === 'monthly' ? 'Monthly review' : 'Year review'}</Title>
      <Muted>
        {review.data ? `${review.data.periodStart} → ${review.data.periodEnd}` : 'Loading summary…'}
      </Muted>
      <ScrollView contentContainerStyle={styles.content}>
        <Text>{`Completed ${summary?.habitsCompleted ?? 0} · missed ${summary?.habitsMissed ?? 0}`}</Text>
        <Text>{`Tasks completed ${summary?.tasksCompleted ?? 0} · knowledge ${summary?.knowledgeCreated ?? 0}`}</Text>
        <Muted>{`Strongest: ${summary?.strongestArea ?? '—'} · Weakest: ${summary?.weakestArea ?? '—'}`}</Muted>
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
