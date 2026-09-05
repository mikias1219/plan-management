import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { api } from '../../api/client';
import { EmptyState, ErrorBanner, HeaderButton, Muted, ProgressBar, Screen, Title } from '../../components/ui';
import { colors, radius, space } from '../../theme';
import type { TodayHabit, TodayPayload } from '../../types';
import { todayDate } from '../../types';
import { useSession } from '../../api/client';

function formatLongDate(date: string) {
  return new Date(`${date}T00:00:00`).toLocaleDateString(undefined, {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

export function TodayScreen({ navigation }: { navigation: { navigate: (name: string, params?: object) => void } }) {
  const user = useSession((s) => s.user);
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

  return (
    <Screen>
      <View style={styles.top}>
        <View style={{ flex: 1 }}>
          <Title>{data?.greeting ?? 'Hello'}{user?.name ? ` ${user.name.split(' ')[0]}` : ''}</Title>
        </View>
        <HeaderButton icon="search-outline" onPress={() => navigation.navigate('Search')} />
        <HeaderButton icon="person-circle-outline" onPress={() => navigation.navigate('Settings')} />
      </View>
      {today.isError ? (
        <ErrorBanner
          message={today.error instanceof Error ? today.error.message : 'Could not load today'}
          onRetry={() => today.refetch()}
        />
      ) : null}
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Muted>{formatLongDate(date)}</Muted>
        {data?.personalYear ? (
          <Text style={styles.yearDay}>Day {data.personalYear.currentDay} of your year</Text>
        ) : (
          <Pressable onPress={() => navigation.navigate('YearSetup')}>
            <Text style={styles.link}>Set your personal year</Text>
          </Pressable>
        )}

        <View style={styles.block}>
          <Text style={styles.section}>Today</Text>
          <ProgressBar value={data?.progress.percent ?? 0} />
          <Muted>
            {data ? `${data.progress.completedHabits} / ${data.progress.totalHabits} habits complete` : 'Loading your day…'}
          </Muted>
        </View>

        {data?.habits.length === 0 ? (
          <EmptyState title="No habits due" body="Add a habit from Plan when you are ready." />
        ) : (
          data?.habits.map((habit) => (
            <View key={habit.id} style={styles.habitRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.habitName}>{habit.name}</Text>
                <Muted>
                  {habit.unit === 'minutes'
                    ? `${habit.current} / ${habit.target} min`
                    : habit.complete
                      ? 'Done'
                      : 'Not yet'}
                </Muted>
              </View>
              <Pressable
                onPress={() => {
                  if (habit.captureStyle === 'complete' && !habit.complete) {
                    complete.mutate(habit);
                    return;
                  }
                  navigation.navigate('Capture', { habitId: habit.id });
                }}
                style={styles.action}
              >
                <Text style={styles.actionLabel}>{habit.actionLabel}</Text>
              </Pressable>
            </View>
          ))
        )}

        <View style={styles.block}>
          <Text style={styles.section}>Today's priorities</Text>
          {data?.priorities?.length ? (
            data.priorities.map((item, index) => (
              <Text key={item.id} style={styles.priority}>
                {index + 1}. {item.title}
              </Text>
            ))
          ) : (
            <Muted>No priorities yet. Add a high-priority task from Plan.</Muted>
          )}
        </View>

        <Pressable onPress={() => navigation.navigate('Journal')} style={styles.journal}>
          <Text style={styles.section}>Daily reflection</Text>
          <Muted>{data?.journal.exists ? 'Journal saved for today' : 'Optional — what went well?'}</Muted>
        </Pressable>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  top: { flexDirection: 'row', alignItems: 'center', marginBottom: space.sm },
  content: { paddingBottom: 120, gap: space.md },
  yearDay: { fontSize: 16, color: colors.text, marginTop: 4 },
  link: { color: colors.accent, fontWeight: '600', marginTop: 6 },
  block: { gap: 8, marginTop: space.sm },
  section: { fontSize: 13, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase', color: colors.muted },
  habitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius,
    borderWidth: 1,
    borderColor: colors.border,
    padding: space.md,
    gap: space.md,
  },
  habitName: { fontSize: 17, fontWeight: '600', color: colors.text },
  action: { paddingHorizontal: 12, paddingVertical: 8 },
  actionLabel: { color: colors.accent, fontWeight: '600' },
  priority: { fontSize: 16, color: colors.text, lineHeight: 24 },
  journal: { paddingVertical: space.md },
});
