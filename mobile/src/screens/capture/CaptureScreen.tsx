import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { api, ApiError } from '../../api/client';
import { Field } from '../../components/Field';
import { ErrorBanner, Muted, PrimaryButton, Screen, Title } from '../../components/ui';
import { enqueue } from '../../offline/outbox';
import { colors, radius, space } from '../../theme';
import { todayDate } from '../../types';

interface Habit {
  id: string;
  name: string;
  lifeAreaId: string;
  captureStyle: string;
  target: number;
  unit: string;
}

const ACTIONS = ['Prayer', 'Bible', 'Exercise', 'English', 'Skill', 'Work', 'Task', 'Journal', 'Knowledge'] as const;

export function CaptureScreen({
  navigation,
  route,
}: {
  navigation: { goBack: () => void; navigate: (name: string, params?: object) => void };
  route: { params?: { habitId?: string; action?: string } };
}) {
  const habits = useQuery({ queryKey: ['habits'], queryFn: () => api<Habit[]>('/habits?active=true') });
  const areas = useQuery({
    queryKey: ['life-areas'],
    queryFn: () => api<Array<{ id: string; name: string }>>('/life-areas'),
  });
  const queryClient = useQueryClient();
  const [action, setAction] = useState<string | undefined>(route.params?.action);
  const [habitId, setHabitId] = useState(route.params?.habitId);
  const [title, setTitle] = useState('');
  const [minutes, setMinutes] = useState('');
  const [note, setNote] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [offlineNote, setOfflineNote] = useState<string | null>(null);

  const selectedHabit =
    habits.data?.find((habit) => habit.id === habitId) ??
    habits.data?.find((habit) => habit.name.toLowerCase().includes((action ?? '').toLowerCase())) ??
    (action === 'Bible' ? habits.data?.find((h) => h.name.includes('Bible')) : undefined) ??
    (action === 'Skill' ? habits.data?.find((h) => h.name.includes('Skill')) : undefined);

  const save = useMutation({
    mutationFn: async () => {
      if (action === 'Task') {
        const lifeAreaId = areas.data?.[5]?.id ?? areas.data?.[0]?.id;
        return api('/tasks', {
          method: 'POST',
          body: JSON.stringify({ title: title || 'New task', lifeAreaId, priority: 'high' }),
        });
      }
      if (!selectedHabit) {
        throw new Error('Choose a habit first');
      }
      const duration = Number(minutes) || (selectedHabit.unit === 'minutes' ? selectedHabit.target : 0);
      const payload = {
        habitId: selectedHabit.id,
        lifeAreaId: selectedHabit.lifeAreaId,
        date: todayDate(),
        title: title || selectedHabit.name,
        description: note,
        status: 'completed',
        durationMinutes: duration,
        clientId: `${Date.now()}-${selectedHabit.id}`,
      };
      try {
        const activity = await api<{ id: string }>('/activities', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
        if (note && selectedHabit.captureStyle === 'learning') {
          await api('/knowledge', {
            method: 'POST',
            body: JSON.stringify({
              title: title || 'Learning note',
              content: note,
              lifeAreaId: selectedHabit.lifeAreaId,
              topic: title || selectedHabit.name,
              relatedHabitId: selectedHabit.id,
              relatedActivityId: activity.id,
            }),
          });
        }
        return activity;
      } catch (err) {
        if (err instanceof ApiError && err.code === 'NETWORK') {
          await enqueue({
            id: payload.clientId,
            entityType: 'activity',
            action: 'create',
            payload,
            createdAt: new Date().toISOString(),
          });
          setOfflineNote("You're offline. Your activity is saved and will sync later.");
          return { offline: true };
        }
        throw err;
      }
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['today'] });
      if (!offlineNote) {
        navigation.goBack();
      }
    },
    onError: (err) => setError(err instanceof Error ? err.message : 'Could not save'),
  });

  return (
    <Screen>
      <Title>Quick add</Title>
      {error ? <ErrorBanner message={error} /> : null}
      {offlineNote ? <ErrorBanner message={offlineNote} /> : null}
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.grid}>
          {ACTIONS.map((item) => (
            <Pressable
              key={item}
              onPress={() => {
                setAction(item);
                if (item === 'Journal') {
                  navigation.navigate('Journal');
                }
                if (item === 'Knowledge') {
                  navigation.navigate('Knowledge');
                }
              }}
              style={[styles.chip, action === item && styles.chipOn]}
            >
              <Text style={[styles.chipLabel, action === item && styles.chipLabelOn]}>{item}</Text>
            </Pressable>
          ))}
        </View>

        {selectedHabit ? (
          <>
            <Muted>
              {selectedHabit.name}
              {selectedHabit.unit === 'minutes' ? ` · target ${selectedHabit.target} min` : ''}
            </Muted>
            {selectedHabit.captureStyle !== 'complete' ? (
              <Field
                value={title}
                onChangeText={setTitle}
                placeholder={selectedHabit.captureStyle === 'learning' ? 'What did you work on?' : 'What did you do?'}
              />
            ) : null}
            {selectedHabit.unit === 'minutes' ? (
              <Field value={minutes} onChangeText={setMinutes} placeholder="How long? (minutes)" keyboardType="numeric" />
            ) : null}
            {selectedHabit.captureStyle === 'learning' ? (
              <Field value={note} onChangeText={setNote} placeholder="Add learning note? (optional)" multiline />
            ) : null}
            <PrimaryButton
              label={
                selectedHabit.captureStyle === 'complete'
                  ? 'Mark complete'
                  : save.isPending
                    ? 'Saving…'
                    : 'Save'
              }
              onPress={() => save.mutate()}
              disabled={save.isPending}
            />
          </>
        ) : action === 'Task' ? (
          <>
            <Field value={title} onChangeText={setTitle} placeholder="Task title" />
            <PrimaryButton label="Add task" onPress={() => save.mutate()} />
          </>
        ) : (
          <Muted>Choose something to record. Most habits take about three taps.</Muted>
        )}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { gap: space.md, paddingVertical: space.md, paddingBottom: 40 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    borderRadius: radius,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  chipOn: { backgroundColor: colors.accentSoft, borderColor: colors.accent },
  chipLabel: { color: colors.text, fontWeight: '500' },
  chipLabelOn: { color: colors.accent },
});
