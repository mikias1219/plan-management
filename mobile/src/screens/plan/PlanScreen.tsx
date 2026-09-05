import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Screen, Title, Muted } from '../../components/ui';
import { colors, radius, space } from '../../theme';

const LINKS = [
  { name: 'PlanDay', label: 'Day', body: 'Today’s habits, tasks, and activities' },
  { name: 'PlanWeek', label: 'Week', body: 'This week at a glance' },
  { name: 'PlanMonth', label: 'Month', body: 'Monthly activity and tasks' },
  { name: 'PlanYear', label: 'Year', body: 'Personal year, goals, and progress' },
  { name: 'YearSetup', label: 'Personal year dates', body: 'Start date, day count, remaining days' },
  { name: 'Goals', label: 'Goals', body: 'Annual → weekly' },
  { name: 'Habits', label: 'Habits', body: 'Recurring behaviors' },
  { name: 'Tasks', label: 'Tasks', body: 'Specific actions' },
  { name: 'Knowledge', label: 'Knowledge', body: 'What you learned' },
  { name: 'Journal', label: 'Journal', body: 'Daily reflection' },
  { name: 'Achievements', label: 'Achievements', body: 'Meaningful milestones' },
];

export function PlanScreen({ navigation }: { navigation: { navigate: (name: string) => void } }) {
  return (
    <Screen>
      <Title>Plan</Title>
      <Muted>Year, goals, habits, and tasks — without extra tabs.</Muted>
      <View style={styles.list}>
        {LINKS.map((link) => (
          <Pressable key={link.name} onPress={() => navigation.navigate(link.name)} style={styles.row}>
            <Text style={styles.label}>{link.label}</Text>
            <Text style={styles.body}>{link.body}</Text>
          </Pressable>
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: { marginTop: space.lg, gap: 10 },
  row: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius,
    padding: space.md,
  },
  label: { fontSize: 17, fontWeight: '600', color: colors.text },
  body: { color: colors.muted, marginTop: 4 },
});
