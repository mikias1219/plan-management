import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { api } from '../../api/client';
import { Field } from '../../components/Field';
import { ErrorBanner, Muted, PrimaryButton, Screen } from '../../components/ui';
import { money, space } from '../../theme';
import { currentMonth } from '../../types';

export function BudgetScreen({ navigation }: { navigation: { goBack: () => void } }) {
  const month = currentMonth();
  const queryClient = useQueryClient();
  const budget = useQuery({
    queryKey: ['finance-budget', month],
    queryFn: () => api<{ amount: number; month: string }>(`/finance/budget?month=${month}`),
  });
  const [amount, setAmount] = useState('');
  const [error, setError] = useState<string | null>(null);
  const value = amount || (budget.data?.amount ? String(budget.data.amount) : '');

  const save = useMutation({
    mutationFn: () =>
      api('/finance/budget', {
        method: 'PUT',
        body: JSON.stringify({ month, amount: Number(value) }),
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['finance-summary'] });
      await queryClient.invalidateQueries({ queryKey: ['finance-budget'] });
      navigation.goBack();
    },
    onError: (err) => setError(err instanceof Error ? err.message : 'Could not save budget'),
  });

  return (
    <Screen safe={false}>
      {error ? <ErrorBanner message={error} /> : null}
      <View style={styles.form}>
        <Field value={value} onChangeText={setAmount} placeholder="Spending cap" keyboardType="decimal-pad" />
        {budget.data?.amount ? <Muted>Current cap {money(budget.data.amount)}</Muted> : null}
        <PrimaryButton
          label={save.isPending ? 'Saving…' : 'Save budget'}
          onPress={() => {
            if (Number(value) < 0) {
              setError('Enter a number');
              return;
            }
            save.mutate();
          }}
          disabled={save.isPending}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  form: { marginTop: space.lg, gap: space.md },
});
