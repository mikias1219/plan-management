import { Ionicons } from '@expo/vector-icons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { api } from '../../api/client';
import { DateField } from '../../components/DateTimeFields';
import {
  EmptyState,
  ErrorBanner,
  Fab,
  Group,
  InsightCard,
  ProgressBar,
  Screen,
  ScreenHeader,
  SectionLabel,
} from '../../components/ui';
import { colors, space } from '../../theme';
import type { DayItem, TodayPayload } from '../../types';
import { todayDate, unitLabel } from '../../types';

export function TodayScreen({ navigation }: { navigation: { navigate: (name: string, params?: object) => void } }) {
  const [date, setDate] = useState(todayDate());
  const queryClient = useQueryClient();
  const today = useQuery({
    queryKey: ['today', date],
    queryFn: () => api<TodayPayload>(`/today?date=${date}`),
  });

  const setStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: DayItem['status'] }) =>
      api(`/day-items/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['today'] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
    },
  });

  const remove = useMutation({
    mutationFn: (id: string) => api(`/day-items/${id}`, { method: 'DELETE' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['today'] }),
  });

  const data = today.data;
  const items = data?.items ?? [];
  const open = items.filter((item) => item.status === 'planned');
  const done = items.filter((item) => item.status === 'done');
  const missed = items.filter((item) => item.status === 'missed');

  function cycleStatus(item: DayItem) {
    const next = item.status === 'planned' ? 'done' : item.status === 'done' ? 'missed' : 'planned';
    setStatus.mutate({ id: item.id, status: next });
  }

  function renderItem(item: DayItem, last: boolean) {
    const tone =
      item.status === 'done' ? colors.success : item.status === 'missed' ? colors.error : colors.accentDim;
    const icon =
      item.status === 'done' ? 'checkmark-circle' : item.status === 'missed' ? 'close-circle' : 'ellipse-outline';
    return (
      <Pressable
        key={item.id}
        onPress={() => cycleStatus(item)}
        onLongPress={() =>
          Alert.alert(item.title, 'Remove this plan item?', [
            { text: 'Cancel' },
            { text: 'Delete', style: 'destructive', onPress: () => remove.mutate(item.id) },
          ])
        }
        style={[styles.item, !last && styles.itemBorder]}
      >
        <Ionicons name={icon} size={24} color={tone} />
        <View style={{ flex: 1 }}>
          <Text style={styles.itemTitle}>{item.title}</Text>
          <Text style={styles.itemMeta}>
            {item.target} {unitLabel(item.unit)}
            {item.plannedTime ? ` · ${item.plannedTime}` : ''}
            {` · ${item.status}`}
          </Text>
        </View>
      </Pressable>
    );
  }

  return (
    <Screen>
      <ScreenHeader
        title="Today"
        subtitle="Plan the day, then check off what you did"
        right={
          <Pressable onPress={() => setDate(todayDate())} style={styles.todayBtn}>
            <Text style={styles.todayBtnLabel}>Now</Text>
          </Pressable>
        }
      />
      <DateField value={date} onChange={setDate} />
      {today.isError ? (
        <ErrorBanner
          message={today.error instanceof Error ? today.error.message : 'Could not load today'}
          onRetry={() => today.refetch()}
        />
      ) : null}

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.meter}>
          <Text style={styles.meterLabel}>Day progress</Text>
          <Text style={styles.meterValue}>
            {data?.progress.completed ?? 0}/{data?.progress.total ?? 0}
          </Text>
          <ProgressBar value={data?.progress.percent ?? 0} />
          <Text style={styles.meterHint}>
            {data?.progress.planned ?? 0} still open
            {(data?.progress.missed ?? 0) > 0 ? ` · ${data?.progress.missed} missed` : ''}
          </Text>
        </View>

        {!items.length ? (
          <EmptyState
            title="Nothing planned yet"
            body="Add what you will do — like 30 push-ups or 30 squats. Later mark each done or missed."
          />
        ) : null}

        {open.length ? (
          <>
            <SectionLabel>To do</SectionLabel>
            <Group>{open.map((item, index) => renderItem(item, index === open.length - 1))}</Group>
          </>
        ) : null}

        {done.length ? (
          <>
            <SectionLabel>Done</SectionLabel>
            <Group>{done.map((item, index) => renderItem(item, index === done.length - 1))}</Group>
          </>
        ) : null}

        {missed.length ? (
          <>
            <SectionLabel>Missed</SectionLabel>
            <Group>{missed.map((item, index) => renderItem(item, index === missed.length - 1))}</Group>
          </>
        ) : null}

        <InsightCard
          icon="add-circle-outline"
          title="Add a plan item"
          body="Example: Push-ups · 30 reps"
          onPress={() => navigation.navigate('AddDayItem', { date })}
        />
      </ScrollView>
      <Fab onPress={() => navigation.navigate('AddDayItem', { date })} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { paddingBottom: 120, gap: 12, paddingTop: 12 },
  todayBtn: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  todayBtnLabel: { fontWeight: '700', color: colors.accentDim },
  meter: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    padding: space.md,
    gap: 8,
  },
  meterLabel: { fontSize: 12, fontWeight: '700', color: colors.muted, textTransform: 'uppercase', letterSpacing: 0.7 },
  meterValue: { fontSize: 32, fontWeight: '700', color: colors.ink, letterSpacing: -0.8 },
  meterHint: { fontSize: 13, color: colors.muted },
  item: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 14, paddingVertical: 14 },
  itemBorder: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.hairline },
  itemTitle: { fontSize: 16, fontWeight: '700', color: colors.ink },
  itemMeta: { fontSize: 13, color: colors.muted, marginTop: 2, textTransform: 'capitalize' },
});
