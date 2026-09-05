import { useQuery } from '@tanstack/react-query';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { api } from '../../api/client';
import { Muted, ProgressBar, Screen, Title } from '../../components/ui';
import { colors, radius, space } from '../../theme';

export function StatsScreen({ navigation }: { navigation: { navigate: (name: string) => void } }) {
  const dashboard = useQuery({
    queryKey: ['analytics'],
    queryFn: () =>
      api<{
        doingWell: string | null;
        neglecting: string | null;
        taskCompletion: number;
        goalProgress: number;
        timeDistribution: Array<{ name: string; minutes: number }>;
        monthlyCompletion: { habitsCompleted: number; habitsMissed: number };
      }>('/analytics/dashboard'),
  });
  const data = dashboard.data;
  const totalMinutes = data?.timeDistribution.reduce((sum, item) => sum + item.minutes, 0) || 1;

  return (
    <Screen>
      <Title>Stats</Title>
      <Muted>Consistency and progress — not a wall of charts.</Muted>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.card}>
          <Text style={styles.label}>Doing well</Text>
          <Text style={styles.value}>{data?.doingWell ?? '—'}</Text>
          <Text style={styles.label}>Neglecting</Text>
          <Text style={styles.value}>{data?.neglecting ?? '—'}</Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.label}>Task completion</Text>
          <ProgressBar value={data?.taskCompletion ?? 0} />
          <Text style={styles.label}>Goal progress</Text>
          <ProgressBar value={data?.goalProgress ?? 0} />
        </View>
        <View style={styles.card}>
          <Text style={styles.label}>Time this month</Text>
          {data?.timeDistribution.map((item) => (
            <View key={item.name} style={{ gap: 4 }}>
              <Muted>{`${item.name} · ${item.minutes} min`}</Muted>
              <ProgressBar value={(item.minutes / totalMinutes) * 100} />
            </View>
          ))}
        </View>
        <Pressable onPress={() => navigation.navigate('WeeklyReview')} style={styles.card}>
          <Text style={styles.value}>Weekly review</Text>
          <Muted>Calculated for you — then a short reflection.</Muted>
        </Pressable>
        <Pressable onPress={() => navigation.navigate('MonthlyReview')} style={styles.card}>
          <Text style={styles.value}>Monthly review</Text>
        </Pressable>
        <Pressable onPress={() => navigation.navigate('YearlyReview')} style={styles.card}>
          <Text style={styles.value}>Year review</Text>
        </Pressable>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { gap: space.md, paddingVertical: space.md, paddingBottom: 40 },
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius,
    padding: space.md,
    gap: 8,
  },
  label: { color: colors.muted, fontSize: 13, textTransform: 'uppercase', letterSpacing: 0.8, fontWeight: '700' },
  value: { fontSize: 18, fontWeight: '600', color: colors.text },
});
