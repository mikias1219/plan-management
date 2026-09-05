import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { api } from '../../api/client';
import { Field } from '../../components/Field';
import { Chip, ErrorBanner, PrimaryButton, Screen, SectionLabel } from '../../components/ui';
import { space } from '../../theme';
import { todayDate } from '../../types';

const EXPENSE = ['Food', 'Transport', 'Housing', 'Health', 'Learning', 'Work', 'Giving', 'Fun', 'Other'];
const INCOME = ['Salary', 'Side', 'Gift', 'Other'];

export function AddTransactionScreen({
  navigation,
  route,
}: {
  navigation: { goBack: () => void };
  route: { params?: { type?: 'income' | 'expense' } };
}) {
  const queryClient = useQueryClient();
  const [type, setType] = useState<'income' | 'expense'>(route.params?.type ?? 'expense');
  const cats = type === 'income' ? INCOME : EXPENSE;
  const [category, setCategory] = useState(cats[0]);
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [error, setError] = useState<string | null>(null);

  const save = useMutation({
    mutationFn: () =>
      api('/finance/transactions', {
        method: 'POST',
        body: JSON.stringify({
          type,
          category,
          amount: Number(amount),
          note,
          date: todayDate(),
        }),
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['finance-summary'] });
      navigation.goBack();
    },
    onError: (err) => setError(err instanceof Error ? err.message : 'Could not save'),
  });

  return (
    <Screen safe={false}>
      {error ? <ErrorBanner message={error} /> : null}
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.row}>
          <Chip
            label="Expense"
            selected={type === 'expense'}
            onPress={() => {
              setType('expense');
              setCategory(EXPENSE[0]);
            }}
          />
          <Chip
            label="Income"
            selected={type === 'income'}
            onPress={() => {
              setType('income');
              setCategory(INCOME[0]);
            }}
          />
        </View>
        <Field value={amount} onChangeText={setAmount} placeholder="Amount" keyboardType="decimal-pad" />
        <SectionLabel>Category</SectionLabel>
        <View style={styles.wrap}>
          {cats.map((item) => (
            <Chip key={item} label={item} selected={category === item} onPress={() => setCategory(item)} />
          ))}
        </View>
        <Field value={note} onChangeText={setNote} placeholder="Note (optional)" />
        <PrimaryButton
          label={save.isPending ? 'Saving…' : 'Save'}
          onPress={() => {
            if (!Number(amount)) {
              setError('Enter an amount');
              return;
            }
            setError(null);
            save.mutate();
          }}
          disabled={save.isPending}
        />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { gap: space.md, paddingVertical: space.md, paddingBottom: 40 },
  row: { flexDirection: 'row', gap: 8 },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
});
