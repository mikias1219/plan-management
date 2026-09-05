import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { api } from '../../api/client';
import { Field } from '../../components/Field';
import { Group, Muted, Row, Screen } from '../../components/ui';
import { money, space } from '../../theme';

export function SearchScreen() {
  const [q, setQ] = useState('');
  const results = useQuery({
    queryKey: ['search', q],
    queryFn: () =>
      api<{
        habits: Array<{ id: string; name: string }>;
        tasks: Array<{ id: string; title: string }>;
        knowledge: Array<{ id: string; title: string }>;
        goals: Array<{ id: string; title: string }>;
        transactions: Array<{ id: string; category: string; amount: number; type: string; note: string }>;
      }>(`/search?q=${encodeURIComponent(q)}`),
    enabled: q.length > 1,
  });

  const empty =
    q.length > 1 &&
    results.data &&
    !results.data.habits.length &&
    !results.data.tasks.length &&
    !results.data.goals.length &&
    !results.data.knowledge.length &&
    !results.data.transactions?.length;

  return (
    <Screen safe={false}>
      <Field value={q} onChangeText={setQ} placeholder="Habits, tasks, notes, money…" />
      <ScrollView contentContainerStyle={styles.list}>
        {results.data?.habits.length ? (
          <Group label="Habits">
            {results.data.habits.map((item, index) => (
              <Row key={item.id} title={item.name} last={index === results.data!.habits.length - 1} />
            ))}
          </Group>
        ) : null}
        {results.data?.tasks.length ? (
          <Group label="Tasks">
            {results.data.tasks.map((item, index) => (
              <Row key={item.id} title={item.title} last={index === results.data!.tasks.length - 1} />
            ))}
          </Group>
        ) : null}
        {results.data?.goals.length ? (
          <Group label="Goals">
            {results.data.goals.map((item, index) => (
              <Row key={item.id} title={item.title} last={index === results.data!.goals.length - 1} />
            ))}
          </Group>
        ) : null}
        {results.data?.knowledge.length ? (
          <Group label="Notes">
            {results.data.knowledge.map((item, index) => (
              <Row key={item.id} title={item.title} last={index === results.data!.knowledge.length - 1} />
            ))}
          </Group>
        ) : null}
        {results.data?.transactions?.length ? (
          <Group label="Money">
            {results.data.transactions.map((item, index) => (
              <Row
                key={item.id}
                title={item.category}
                subtitle={item.note}
                value={money(item.amount)}
                last={index === results.data!.transactions.length - 1}
              />
            ))}
          </Group>
        ) : null}
        {q.length > 1 && results.isFetching && !results.data ? <Muted>Searching…</Muted> : null}
        {empty ? <Muted>No matches yet.</Muted> : null}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: { gap: 22, paddingVertical: space.md },
});
