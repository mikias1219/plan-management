import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { api } from '../../api/client';
import { Field } from '../../components/Field';
import { PrimaryButton, Screen } from '../../components/ui';
import { space } from '../../theme';

export function CreateGoalScreen({ navigation }: { navigation: { goBack: () => void } }) {
  const areas = useQuery({
    queryKey: ['life-areas'],
    queryFn: () => api<Array<{ id: string; name: string }>>('/life-areas'),
  });
  const [title, setTitle] = useState('');
  const [period, setPeriod] = useState('monthly');

  return (
    <Screen safe={false}>
      <View style={styles.form}>
        <Field value={title} onChangeText={setTitle} placeholder="Become strong in DevOps" />
        <Field value={period} onChangeText={setPeriod} placeholder="annual | quarterly | monthly | weekly" />
        <PrimaryButton
          label="Save goal"
          onPress={async () => {
            await api('/goals', {
              method: 'POST',
              body: JSON.stringify({
                title,
                period,
                lifeAreaId: areas.data?.[3]?.id ?? areas.data?.[0]?.id,
                target: 1,
                unit: 'count',
              }),
            });
            navigation.goBack();
          }}
        />
      </View>
    </Screen>
  );
}

export function CreateTaskScreen({ navigation }: { navigation: { goBack: () => void } }) {
  const [title, setTitle] = useState('');
  const areas = useQuery({
    queryKey: ['life-areas'],
    queryFn: () => api<Array<{ id: string }>>('/life-areas'),
  });

  return (
    <Screen safe={false}>
      <View style={styles.form}>
        <Field value={title} onChangeText={setTitle} placeholder="Build Docker Compose practice project" />
        <PrimaryButton
          label="Save task"
          onPress={async () => {
            await api('/tasks', {
              method: 'POST',
              body: JSON.stringify({
                title,
                lifeAreaId: areas.data?.[4]?.id ?? areas.data?.[0]?.id,
                priority: 'high',
              }),
            });
            navigation.goBack();
          }}
        />
      </View>
    </Screen>
  );
}

export function CreateAchievementScreen({ navigation }: { navigation: { goBack: () => void } }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const areas = useQuery({
    queryKey: ['life-areas'],
    queryFn: () => api<Array<{ id: string }>>('/life-areas'),
  });

  return (
    <Screen safe={false}>
      <View style={styles.form}>
        <Field value={title} onChangeText={setTitle} placeholder="Completed Docker fundamentals" />
        <Field value={description} onChangeText={setDescription} placeholder="Why it matters" />
        <PrimaryButton
          label="Save achievement"
          onPress={async () => {
            await api('/achievements', {
              method: 'POST',
              body: JSON.stringify({
                title,
                description,
                date: new Date().toISOString().slice(0, 10),
                lifeAreaId: areas.data?.[3]?.id ?? areas.data?.[0]?.id,
              }),
            });
            navigation.goBack();
          }}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  form: { marginTop: space.lg, gap: 12 },
});
