import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { api } from '../../api/client';
import { ErrorBanner, Fab, Group, ProgressBar, Screen, ScreenHeader } from '../../components/ui';
import { colors, space } from '../../theme';
import type { TodayHabit, TodayPayload } from '../../types';
import { todayDate } from '../../types';

function formatLongDate(date: string) {
  return new Date(`${date}T00:00:00`).toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
}

export function TodayScreen({ navigation }: { navigation: { navigate: (name: string, params?: object) => void } }) {
  const date = todayDate();
  const queryClient = useQueryClient();
  const today = useQuery({
    queryKey: ['today', date],
    queryFn: () => api<TodayPayload>(`/today?date=${date}`),
  });

  const complete = useMutation({
    mutationFn: (habit: TodayHabit) =>
      api('/activities', {
        method: 'POST',
        body: JSON.stringify({
          habitId: habit.id,
          lifeAreaId: habit.lifeAreaId,
          date,
          title: habit.name,
          status: 'completed',
          durationMinutes: habit.unit === 'minutes' ? Math.max(habit.target - habit.current, habit.target) : 0,
          clientId: `${Date.now()}-${habit.id}`,
        }),
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['today'] }),
  });

  const data = today.data;
  const remaining = (data?.habits ?? []).filter((h) => !h.complete).length;

  return (
    <Screen>
      <ScreenHeader
        kicker={formatLongDate(date)}
        title="Today"
        subtitle={data ? `${data.progress.completedHabits} done · ${remaining} left` : 'Your daily loop'}
      />
      {today.isError ? (
        <ErrorBanner
          message={today.error instanceof Error ? today.error.message : 'Could not load today'}
          onRetry={() => today.refetch()}
        />
      ) : null}
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.meter}>
          <Text style={styles.meterLabel}>Completion</Text>
          <Text style={styles.meterValue}>{data?.progress.percent ?? 0}%</Text>
          <ProgressBar value={data?.progress.percent ?? 0} />
        </View>

        <Group label="Habits">
          {!data?.habits.length ? (
            <View style={styles.emptyPad}>
              <Text style={styles.emptyTitle}>Nothing due</Text>
              <Text style={styles.emptyBody}>Add habits from Plan.</Text>
            </View>
          ) : (
            data.habits.map((habit, index) => {
              const pct = habit.target > 0 ? (habit.current / habit.target) * 100 : habit.complete ? 100 : 0;
              const last = index === data.habits.length - 1;
              return (
                <Pressable
                  key={habit.id}
                  onPress={() => {
                    if (habit.captureStyle === 'complete' && !habit.complete) {
                      complete.mutate(habit);
                      return;
                    }
                    navigation.navigate('Capture', { habitId: habit.id });
                  }}
                  style={[styles.habit, !last && styles.habitBorder]}
                >
                  <View style={[styles.check, habit.complete && styles.checkOn]}>
                    <Ionicons name={habit.complete ? 'checkmark' : 'ellipse-outline'} size={18} color={habit.complete ? '#fff' : colors.muted} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.habitName}>{habit.name}</Text>
                    <Text style={styles.habitMeta}>
                      {habit.unit === 'minutes'
                        ? `${habit.current} / ${habit.target} min`
                        : habit.complete
                          ? 'Complete'
                          : habit.actionLabel}
                    </Text>
                    <View style={{ marginTop: 8 }}>
                      <ProgressBar value={pct} color={habit.complete ? colors.success : colors.accent} />
                    </View>
                  </View>
                </Pressable>
              );
            })
          )}
        </Group>

        <Group label="Priorities">
          {!data?.priorities?.length ? (
            <View style={styles.emptyPad}>
              <Text style={styles.emptyBody}>No high-priority tasks. Add one from Plan.</Text>
            </View>
          ) : (
            data.priorities.map((item, index) => (
              <Pressable
                key={item.id}
                onPress={() => navigation.navigate('Tasks')}
                style={[styles.priority, index < data.priorities.length - 1 && styles.habitBorder]}
              >
                <Text style={styles.num}>{index + 1}</Text>
                <Text style={styles.priorityTitle}>{item.title}</Text>
              </Pressable>
            ))
          )}
        </Group>
      </ScrollView>
      <Fab onPress={() => navigation.navigate('Capture')} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { paddingBottom: 120, gap: 22, paddingTop: 8 },
  meter: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    padding: space.md,
    gap: 10,
  },
  meterLabel: { fontSize: 12, fontWeight: '700', letterSpacing: 0.8, textTransform: 'uppercase', color: colors.muted },
  meterValue: { fontSize: 32, fontWeight: '700', color: colors.ink, letterSpacing: -0.8 },
  habit: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, paddingHorizontal: 14, paddingVertical: 14 },
  habitBorder: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.hairline },
  check: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  checkOn: { backgroundColor: colors.success, borderColor: colors.success },
  habitName: { fontSize: 16, fontWeight: '600', color: colors.ink },
  habitMeta: { fontSize: 13, color: colors.muted, marginTop: 2 },
  emptyPad: { padding: 16 },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: colors.ink },
  emptyBody: { fontSize: 14, color: colors.muted, marginTop: 4 },
  priority: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 14, paddingVertical: 14 },
  num: { width: 24, fontSize: 16, fontWeight: '700', color: colors.accentDim },
  priorityTitle: { flex: 1, fontSize: 16, fontWeight: '600', color: colors.ink },
});
