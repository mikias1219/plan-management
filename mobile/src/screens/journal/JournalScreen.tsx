import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { api } from '../../api/client';
import { Field } from '../../components/Field';
import { Muted, PrimaryButton, Screen } from '../../components/ui';
import { space } from '../../theme';
import { todayDate } from '../../types';

export function JournalScreen() {
  const date = todayDate();
  const existing = useQuery({
    queryKey: ['journal', date],
    queryFn: () =>
      api<{
        wentWell: string;
        accomplished: string;
        failedToComplete: string;
        learned: string;
        improveTomorrow: string;
      } | null>(`/journal?date=${date}`),
  });
  const [wentWell, setWentWell] = useState('');
  const [accomplished, setAccomplished] = useState('');
  const [failedToComplete, setFailed] = useState('');
  const [learned, setLearned] = useState('');
  const [improveTomorrow, setImprove] = useState('');

  const loaded = existing.data;
  const values = {
    wentWell: wentWell || loaded?.wentWell || '',
    accomplished: accomplished || loaded?.accomplished || '',
    failedToComplete: failedToComplete || loaded?.failedToComplete || '',
    learned: learned || loaded?.learned || '',
    improveTomorrow: improveTomorrow || loaded?.improveTomorrow || '',
  };

  return (
    <Screen safe={false}>
      <Muted>Optional. The system already knows what you completed.</Muted>
      <ScrollView contentContainerStyle={styles.form}>
        <Field value={values.wentWell} onChangeText={setWentWell} placeholder="What went well?" multiline />
        <Field value={values.accomplished} onChangeText={setAccomplished} placeholder="What did I accomplish?" multiline />
        <Field value={values.failedToComplete} onChangeText={setFailed} placeholder="What did I fail to complete?" multiline />
        <Field value={values.learned} onChangeText={setLearned} placeholder="What did I learn?" multiline />
        <Field value={values.improveTomorrow} onChangeText={setImprove} placeholder="What should I improve tomorrow?" multiline />
        <PrimaryButton
          label="Save reflection"
          onPress={() =>
            api('/journal', {
              method: 'POST',
              body: JSON.stringify({ date, ...values, wentWell: wentWell || values.wentWell, accomplished: accomplished || values.accomplished }),
            })
          }
        />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  form: { gap: 12, paddingVertical: space.md, paddingBottom: 40 },
});
