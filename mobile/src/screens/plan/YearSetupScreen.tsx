import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { api } from '../../api/client';
import { Field } from '../../components/Field';
import { ErrorBanner, Muted, PrimaryButton, Screen, Title } from '../../components/ui';

export function YearSetupScreen({ navigation }: { navigation: { goBack: () => void } }) {
  const active = useQuery({
    queryKey: ['personal-year'],
    queryFn: () => api<{ startDate: string; currentDay: number; totalDays: number; percentComplete: number } | null>('/personal-years/active'),
  });
  const [startDate, setStartDate] = useState('2026-09-11');
  const [error, setError] = useState<string | null>(null);

  async function save() {
    setError(null);
    try {
      await api('/personal-years', { method: 'POST', body: JSON.stringify({ startDate }) });
      navigation.goBack();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save year');
    }
  }

  return (
    <Screen>
      <Title>Personal year</Title>
      {active.data ? (
        <Muted>
          Day {active.data.currentDay} of {active.data.totalDays} · {active.data.percentComplete}% complete
        </Muted>
      ) : (
        <Muted>Choose the first day of your year. End date is calculated automatically (365 days).</Muted>
      )}
      {error ? <ErrorBanner message={error} /> : null}
      <View style={styles.form}>
        <Field value={startDate} onChangeText={setStartDate} placeholder="Start date YYYY-MM-DD" />
        <PrimaryButton label="Save year" onPress={save} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  form: { marginTop: 20, gap: 12 },
});
