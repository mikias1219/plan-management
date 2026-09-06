import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { api } from '../../api/client';
import { DateField, TimeField } from '../../components/DateTimeFields';
import { Field } from '../../components/Field';
import { Chip, ErrorBanner, PrimaryButton, Screen, SectionLabel } from '../../components/ui';
import { space } from '../../theme';
import type { DayItemUnit } from '../../types';
import { todayDate } from '../../types';

const UNITS: DayItemUnit[] = ['reps', 'minutes', 'count'];

export function AddDayItemScreen({
  navigation,
  route,
}: {
  navigation: { goBack: () => void };
  route: { params?: { date?: string } };
}) {
  const queryClient = useQueryClient();
  const [date, setDate] = useState(route.params?.date ?? todayDate());
  const [title, setTitle] = useState('');
  const [target, setTarget] = useState('30');
  const [unit, setUnit] = useState<DayItemUnit>('reps');
  const [plannedTime, setPlannedTime] = useState<string | undefined>();
  const [error, setError] = useState<string | null>(null);

  const save = useMutation({
    mutationFn: () =>
      api('/day-items', {
        method: 'POST',
        body: JSON.stringify({
          date,
          title: title.trim(),
          target: Number(target),
          unit,
          plannedTime,
        }),
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['today'] });
      navigation.goBack();
    },
    onError: (err) => setError(err instanceof Error ? err.message : 'Could not save'),
  });

  return (
    <Screen safe={false}>
      {error ? <ErrorBanner message={error} /> : null}
      <ScrollView contentContainerStyle={styles.content}>
        <DateField label="Day" value={date} onChange={setDate} />
        <Field value={title} onChangeText={setTitle} placeholder="What will you do? e.g. Push-ups" />
        <Field value={target} onChangeText={setTarget} placeholder="Target number" keyboardType="numeric" />
        <SectionLabel>Unit</SectionLabel>
        <View style={styles.row}>
          {UNITS.map((item) => (
            <Chip key={item} label={item} selected={unit === item} onPress={() => setUnit(item)} />
          ))}
        </View>
        <TimeField label="Optional time" value={plannedTime} onChange={setPlannedTime} optional />
        <PrimaryButton
          label={save.isPending ? 'Saving…' : 'Add to day plan'}
          disabled={save.isPending}
          onPress={() => {
            if (!title.trim()) {
              setError('Enter what you will do');
              return;
            }
            if (!Number(target) || Number(target) < 1) {
              setError('Enter a target number');
              return;
            }
            setError(null);
            save.mutate();
          }}
        />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { gap: space.md, paddingVertical: space.md, paddingBottom: 40 },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
});
