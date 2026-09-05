import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text } from 'react-native';
import { api } from '../../api/client';
import { Field } from '../../components/Field';
import { Muted, Screen, Title } from '../../components/ui';
import { space } from '../../theme';

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
      }>(`/search?q=${encodeURIComponent(q)}`),
    enabled: q.length > 1,
  });

  return (
    <Screen>
      <Title>Search</Title>
      <Field value={q} onChangeText={setQ} placeholder="Habits, tasks, knowledge…" />
      <ScrollView contentContainerStyle={styles.list}>
        {results.data?.habits.map((item) => (
          <Text key={item.id} style={styles.row}>{`Habit · ${item.name}`}</Text>
        ))}
        {results.data?.tasks.map((item) => (
          <Text key={item.id} style={styles.row}>{`Task · ${item.title}`}</Text>
        ))}
        {results.data?.goals.map((item) => (
          <Text key={item.id} style={styles.row}>{`Goal · ${item.title}`}</Text>
        ))}
        {results.data?.knowledge.map((item) => (
          <Text key={item.id} style={styles.row}>{`Knowledge · ${item.title}`}</Text>
        ))}
        {q.length > 1 && results.isFetching && !results.data ? <Muted>Searching…</Muted> : null}
        {q.length > 1 &&
        results.data &&
        !results.data.habits.length &&
        !results.data.tasks.length &&
        !results.data.goals.length &&
        !results.data.knowledge.length ? (
          <Muted>No matches yet.</Muted>
        ) : null}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: { gap: 10, paddingVertical: space.md },
  row: { fontSize: 16 },
});
