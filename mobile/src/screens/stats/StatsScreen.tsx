import { useQuery } from '@tanstack/react-query';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { api } from '../../api/client';
import { Card, Muted, ProgressBar, Screen, SectionLabel, Title } from '../../components/ui';
import { colors, space } from '../../theme';

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
  const done = data?.monthlyCompletion.habitsCompleted ?? 0;
  const missed = data?.monthlyCompletion.habitsMissed ?? 0;
  const habitPct = done + missed ? Math.round((done / (done + missed)) * 100) : 0;

  return (
    <Screen>
      <Title>You</Title>
      <Muted>See progress clearly — then review when the period ends.</Muted>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Card tone="forest">
          <Text style={styles.heroKicker}>Doing well</Text>
          <Text style={styles.heroValue}>{data?.doingWell ?? 'Keep going'}</Text>
          <Text style={styles.heroMuted}>Neglecting · {data?.neglecting ?? 'Nothing flagged'}</Text>
        </Card>

        <View style={styles.grid}>
          <Card style={{ flex: 1 }}>
            <SectionLabel>Tasks</SectionLabel>
            <Text style={styles.stat}>{Math.round(data?.taskCompletion ?? 0)}%</Text>
            <ProgressBar value={data?.taskCompletion ?? 0} />
          </Card>
          <Card style={{ flex: 1 }}>
            <SectionLabel>Goals</SectionLabel>
            <Text style={styles.stat}>{Math.round(data?.goalProgress ?? 0)}%</Text>
            <ProgressBar value={data?.goalProgress ?? 0} />
          </Card>
        </View>

        <Card>
          <SectionLabel>Habits this month</SectionLabel>
          <Text style={styles.cardTitle}>
            {done} done · {missed} missed
          </Text>
          <ProgressBar value={habitPct} />
        </Card>

        {data?.timeDistribution.length ? (
          <Card>
            <SectionLabel>Time this month</SectionLabel>
            {data.timeDistribution.map((item) => (
              <View key={item.name} style={styles.time}>
                <View style={styles.timeRow}>
                  <Text style={styles.catName}>{item.name}</Text>
                  <Muted>{item.minutes} min</Muted>
                </View>
                <ProgressBar value={(item.minutes / totalMinutes) * 100} color={colors.accent} />
              </View>
            ))}
          </Card>
        ) : null}

        <SectionLabel>Reviews</SectionLabel>
        <Card onPress={() => navigation.navigate('WeeklyReview')}>
          <Text style={styles.cardTitle}>Weekly review</Text>
          <Muted>Calculated for you — then a short reflection</Muted>
        </Card>
        <Card onPress={() => navigation.navigate('MonthlyReview')}>
          <Text style={styles.cardTitle}>Monthly review</Text>
          <Muted>Look at the month without a wall of charts</Muted>
        </Card>
        <Card onPress={() => navigation.navigate('YearlyReview')}>
          <Text style={styles.cardTitle}>Year review</Text>
          <Muted>Personal year progress and what to keep</Muted>
        </Card>
        <Card onPress={() => navigation.navigate('Journal')}>
          <Text style={styles.cardTitle}>Journal</Text>
          <Muted>Daily reflection, optional</Muted>
        </Card>
        <Card onPress={() => navigation.navigate('Settings')}>
          <Text style={styles.cardTitle}>Settings</Text>
          <Muted>Account, Google Docs, sync</Muted>
        </Card>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { gap: space.md, paddingVertical: space.md, paddingBottom: 40 },
  heroKicker: { color: 'rgba(255,255,255,0.65)', fontSize: 12, fontWeight: '700', letterSpacing: 1.2, textTransform: 'uppercase' },
  heroValue: { color: '#fff', fontSize: 26, fontWeight: '700', letterSpacing: -0.4 },
  heroMuted: { color: 'rgba(255,255,255,0.78)', fontSize: 15 },
  grid: { flexDirection: 'row', gap: 10 },
  stat: { fontSize: 28, fontWeight: '700', color: colors.ink, letterSpacing: -0.6 },
  cardTitle: { fontSize: 17, fontWeight: '700', color: colors.ink },
  time: { gap: 6 },
  timeRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  catName: { fontWeight: '600', color: colors.ink },
});
