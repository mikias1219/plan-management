import { useQuery } from '@tanstack/react-query';
import { ScrollView, StyleSheet } from 'react-native';
import { api } from '../../api/client';
import { EmptyState, Group, Row, Screen } from '../../components/ui';
import { space } from '../../theme';

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
    <Screen safe={false}>
      <ScrollView contentContainerStyle={styles.list}>
        <Group label="Topics">
          {(areas.data ?? []).map((area) => (
            <Row
              key={area.id}
              icon="folder-outline"
              title={area.name}
              value={countMap.get(area.id) ?? 0}
              onPress={() => navigation.navigate('KnowledgeArea', { lifeAreaId: area.id, name: area.name })}
            />
          ))}
          <Row
            icon="add-outline"
            title="New note"
            subtitle="One living document per topic"
            last
            onPress={() => navigation.navigate('KnowledgeEditor', {})}
          />
        </Group>
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

  const items = [
    ...(docs.data ?? []).map((doc) => ({
      id: doc.id,
      title: doc.title,
      subtitle: `Google Doc · ${doc.syncStatus}`,
      onPress: () => navigation.navigate('KnowledgeEditor', { documentId: doc.id }),
    })),
    ...(notes.data ?? []).map((note) => ({
      id: note.id,
      title: note.title,
      subtitle: note.topic || 'Note',
      onPress: () => navigation.navigate('KnowledgeEditor', { knowledgeId: note.id, lifeAreaId: route.params.lifeAreaId }),
    })),
  ];

  return (
    <Screen safe={false}>
      <ScrollView contentContainerStyle={styles.list}>
        <Group>
          <Row
            icon="add-outline"
            title="New note"
            last={!items.length}
            onPress={() => navigation.navigate('KnowledgeEditor', { lifeAreaId: route.params.lifeAreaId })}
          />
          {items.map((item, index) => (
            <Row
              key={item.id}
              icon="document-text-outline"
              title={item.title}
              subtitle={item.subtitle}
              last={index === items.length - 1}
              onPress={item.onPress}
            />
          ))}
        </Group>
        {!items.length ? <EmptyState title="No notes yet" body="Capture learning from Skill or create a topic document." /> : null}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: { gap: 16, paddingVertical: space.md, paddingBottom: 40 },
});
