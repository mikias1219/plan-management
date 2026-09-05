import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { api } from '../../api/client';
import { Field } from '../../components/Field';
import { ErrorBanner, Muted, PrimaryButton, Screen, Title } from '../../components/ui';
import { colors, radius, space } from '../../theme';

function wrap(content: string, before: string, after = before) {
  return `${before}${content}${after}`;
}

export function KnowledgeEditorScreen({
  route,
  navigation,
}: {
  route: { params?: { knowledgeId?: string; documentId?: string; lifeAreaId?: string } };
  navigation: { goBack: () => void };
}) {
  const [title, setTitle] = useState('');
  const [topic, setTopic] = useState('');
  const [content, setContent] = useState('');
  const [lifeAreaId, setLifeAreaId] = useState(route.params?.lifeAreaId ?? '');
  const [error, setError] = useState<string | null>(null);
  const [sync, setSync] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const areas = useQuery({
    queryKey: ['life-areas'],
    queryFn: () => api<Array<{ id: string; name: string }>>('/life-areas'),
  });

  const existing = useQuery({
    queryKey: ['knowledge-item', route.params?.knowledgeId, route.params?.documentId],
    queryFn: async () => {
      if (route.params?.knowledgeId) {
        return api<{ title: string; content: string; topic: string; lifeAreaId: string }>(`/knowledge/${route.params.knowledgeId}`);
      }
      if (route.params?.documentId) {
        return api<{ title: string; localContent: string; topic: string; lifeAreaId?: string; syncStatus: string; lastError?: string; webViewLink?: string }>(
          `/documents/${route.params.documentId}`,
        );
      }
      return null;
    },
  });

  useEffect(() => {
    if (!existing.data) {
      return;
    }
    setTitle(existing.data.title);
    setTopic(existing.data.topic ?? '');
    if ('content' in existing.data) {
      setContent(existing.data.content);
      setLifeAreaId(existing.data.lifeAreaId);
    } else {
      setContent(existing.data.localContent);
      setLifeAreaId(existing.data.lifeAreaId ?? '');
      setSync(existing.data.syncStatus);
    }
  }, [existing.data]);

  function apply(format: string) {
    if (format === 'h1') setContent((c) => `${c}\n# `);
    if (format === 'h2') setContent((c) => `${c}\n## `);
    if (format === 'bold') setContent((c) => `${c}**bold**`);
    if (format === 'italic') setContent((c) => `${c}*italic*`);
    if (format === 'ul') setContent((c) => `${c}\n- `);
    if (format === 'ol') setContent((c) => `${c}\n1. `);
    if (format === 'check') setContent((c) => `${c}\n- [ ] `);
    if (format === 'code') setContent((c) => `${c}\n\`\`\`\n\n\`\`\`\n`);
    if (format === 'inline') setContent((c) => `${c}\`${wrap('code', '')}\``);
    if (format === 'link') setContent((c) => `${c}[text](https://)`);
  }

  async function save() {
    setError(null);
    try {
      const areaId = lifeAreaId || areas.data?.[3]?.id;
      if (route.params?.documentId) {
        const doc = await api<{ syncStatus: string; lastError?: string }>(`/documents/${route.params.documentId}`, {
          method: 'PATCH',
          body: JSON.stringify({ title, topic, localContent: content }),
        });
        setSync(doc.syncStatus);
        if (doc.syncStatus === 'failed') {
          setError(doc.lastError ?? "Couldn't sync this document. Retry.");
        }
      } else if (route.params?.knowledgeId) {
        await api(`/knowledge/${route.params.knowledgeId}`, {
          method: 'PATCH',
          body: JSON.stringify({ title, topic, content }),
        });
      } else {
        await api('/knowledge', {
          method: 'POST',
          body: JSON.stringify({ title: title || 'Untitled', content, topic, lifeAreaId: areaId }),
        });
      }
      await queryClient.invalidateQueries({ queryKey: ['knowledge'] });
      navigation.goBack();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save note');
    }
  }

  async function createGoogleDoc() {
    try {
      const areaId = lifeAreaId || areas.data?.[3]?.id;
      const doc = await api<{ id: string; syncStatus: string }>(`/documents`, {
        method: 'POST',
        body: JSON.stringify({ title: title || 'Untitled', content, topic, lifeAreaId: areaId }),
      });
      setSync(doc.syncStatus);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't sync this document. Retry.");
    }
  }

  async function retry() {
    if (!route.params?.documentId) {
      return;
    }
    const doc = await api<{ syncStatus: string; lastError?: string }>(`/documents/${route.params.documentId}/retry-sync`, {
      method: 'POST',
    });
    setSync(doc.syncStatus);
    if (doc.syncStatus === 'failed') {
      setError(doc.lastError ?? "Couldn't sync this document. Retry.");
    }
  }

  return (
    <Screen>
      <Title>Editor</Title>
      {sync ? <Muted>Sync: {sync}</Muted> : null}
      {error ? <ErrorBanner message={error} onRetry={route.params?.documentId ? retry : undefined} /> : null}
      <View style={styles.toolbar}>
        {['h1', 'h2', 'bold', 'italic', 'ul', 'ol', 'check', 'code'].map((item) => (
          <Pressable key={item} onPress={() => apply(item)} style={styles.tool}>
            <Text style={styles.toolLabel}>{item}</Text>
          </Pressable>
        ))}
      </View>
      <ScrollView contentContainerStyle={styles.form}>
        <Field value={title} onChangeText={setTitle} placeholder="Title" />
        <Field value={topic} onChangeText={setTopic} placeholder="Topic — e.g. Docker Networking" />
        <Field value={content} onChangeText={setContent} placeholder="Write what you learned. Code blocks welcome." multiline />
        <PrimaryButton label="Save" onPress={save} />
        {!route.params?.documentId ? <PrimaryButton label="Save as Google Doc" onPress={createGoogleDoc} /> : null}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  toolbar: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginVertical: space.sm },
  tool: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius,
    paddingHorizontal: 8,
    paddingVertical: 6,
    backgroundColor: colors.surface,
  },
  toolLabel: { fontSize: 12, color: colors.text, fontWeight: '600' },
  form: { gap: 12, paddingBottom: 40 },
});
