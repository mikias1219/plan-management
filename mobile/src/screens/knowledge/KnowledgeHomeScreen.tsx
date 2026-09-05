import { useQuery } from '@tanstack/react-query';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { api } from '../../api/client';
import { EmptyState, Muted, Screen, Title } from '../../components/ui';
import { colors, radius, space } from '../../theme';

export function KnowledgeHomeScreen({
  navigation,
}: {
  navigation: { navigate: (name: string, params?: object) => void };
}) {
  const areas = useQuery({
    queryKey: ['life-areas'],
    queryFn: () => api<Array<{ id: string; name: string }>>('/life-areas'),
  });
  const counts = useQuery({
    queryKey: ['document-counts'],
    queryFn: () => api<Array<{ _id: string; count: number }>>('/documents/counts'),
  });
  const countMap = new Map((counts.data ?? []).map((row) => [String(row._id), row.count]));

  return (
    <Screen>
      <Title>Knowledge</Title>
      <Muted>Durable topic notes — not one document per activity.</Muted>
      <ScrollView contentContainerStyle={styles.list}>
        {areas.data?.map((area) => (
          <Pressable
            key={area.id}
            onPress={() => navigation.navigate('KnowledgeArea', { lifeAreaId: area.id, name: area.name })}
            style={styles.row}
          >
            <Text style={styles.name}>{area.name}</Text>
            <Muted>{countMap.get(area.id) ?? 0} documents</Muted>
          </Pressable>
        ))}
        <Pressable onPress={() => navigation.navigate('KnowledgeEditor', {})} style={styles.row}>
          <Text style={styles.name}>New note</Text>
        </Pressable>
      </ScrollView>
    </Screen>
  );
}

export function KnowledgeAreaScreen({
  route,
  navigation,
}: {
  route: { params: { lifeAreaId: string; name: string } };
  navigation: { navigate: (name: string, params?: object) => void };
}) {
  const notes = useQuery({
    queryKey: ['knowledge', route.params.lifeAreaId],
    queryFn: async () => {
      const data = await api<unknown>(`/knowledge?lifeAreaId=${route.params.lifeAreaId}`);
      if (Array.isArray(data)) {
        return data as Array<{ id: string; title: string; topic: string }>;
      }
      if (data && typeof data === 'object' && 'data' in data) {
        return (data as { data: Array<{ id: string; title: string; topic: string }> }).data;
      }
      return [];
    },
  });
  const docs = useQuery({
    queryKey: ['documents', route.params.lifeAreaId],
    queryFn: () =>
      api<Array<{ id: string; title: string; syncStatus: string }>>(`/documents?lifeAreaId=${route.params.lifeAreaId}`),
  });

  return (
    <Screen>
      <Title>{route.params.name}</Title>
      <ScrollView contentContainerStyle={styles.list}>
        <Pressable
          onPress={() => navigation.navigate('KnowledgeEditor', { lifeAreaId: route.params.lifeAreaId })}
          style={styles.row}
        >
          <Text style={styles.name}>New note</Text>
          <Muted>Keep topic docs, not one note per activity.</Muted>
        </Pressable>
        {!notes.data?.length && !docs.data?.length ? (
          <EmptyState title="No notes yet" body="Capture learning from Skill or create a topic document." />
        ) : null}
        {docs.data?.map((doc) => (
          <Pressable
            key={doc.id}
            onPress={() => navigation.navigate('KnowledgeEditor', { documentId: doc.id })}
            style={styles.row}
          >
            <Text style={styles.name}>{doc.title}</Text>
            <Muted>Google Doc · {doc.syncStatus}</Muted>
          </Pressable>
        ))}
        {notes.data?.map((note) => (
          <Pressable
            key={note.id}
            onPress={() => navigation.navigate('KnowledgeEditor', { knowledgeId: note.id, lifeAreaId: route.params.lifeAreaId })}
            style={styles.row}
          >
            <Text style={styles.name}>{note.title}</Text>
            <Muted>{note.topic || 'Note'}</Muted>
          </Pressable>
        ))}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: { gap: 10, paddingVertical: space.md, paddingBottom: 40 },
  row: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius,
    padding: space.md,
  },
  name: { fontSize: 16, fontWeight: '600', color: colors.text },
});
