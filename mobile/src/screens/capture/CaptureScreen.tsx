import { ScrollView, StyleSheet } from 'react-native';
import { Screen } from '../../components/ui';
import { Row, Group } from '../../components/ui';
import { todayDate } from '../../types';

export function CaptureScreen({
  navigation,
}: {
  navigation: { goBack: () => void; navigate: (name: string, params?: object) => void };
  route: { params?: { habitId?: string; action?: string } };
}) {
  const date = todayDate();

  return (
    <Screen safe={false}>
      <ScrollView contentContainerStyle={styles.content}>
        <Group label="Add">
          <Row
            icon="checkbox-outline"
            title="Plan item"
            subtitle="e.g. 30 push-ups for today"
            onPress={() => navigation.navigate('AddDayItem', { date })}
          />
          <Row
            icon="remove-circle-outline"
            title="Expense"
            subtitle="Money out"
            tone="danger"
            onPress={() => navigation.navigate('AddTransaction', { type: 'expense', date })}
          />
          <Row
            icon="add-circle-outline"
            title="Income"
            subtitle="Money in"
            tone="success"
            onPress={() => navigation.navigate('AddTransaction', { type: 'income', date })}
          />
          <Row
            icon="book-outline"
            title="Learning note"
            subtitle="Save what you learned"
            onPress={() => navigation.navigate('KnowledgeEditor', {})}
          />
          <Row
            icon="create-outline"
            title="Journal"
            subtitle="End-of-day reflection"
            last
            onPress={() => navigation.navigate('Journal')}
          />
        </Group>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { gap: 12, paddingVertical: 16, paddingBottom: 40 },
});
