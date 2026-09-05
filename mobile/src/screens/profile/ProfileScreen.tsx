import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';
import { useQuery } from '@tanstack/react-query';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { api, apiUrl, useSession } from '../../api/client';
import { flushOutbox } from '../../offline/outbox';
import { Group, Row, Screen, ScreenHeader } from '../../components/ui';
import { colors } from '../../theme';

export function ProfileScreen({ navigation }: { navigation: { navigate: (name: string) => void } }) {
  const user = useSession((s) => s.user);
  const clear = useSession((s) => s.clear);
  const google = useQuery({
    queryKey: ['google-status'],
    queryFn: () => api<{ configured: boolean; connected: boolean; email: string | null }>('/google/status'),
  });
  const profile = useQuery({
    queryKey: ['me'],
    queryFn: () => api<{ name: string; email: string; timezone: string; googleAccount?: { connected: boolean } }>('/users/me'),
  });

  const name = profile.data?.name ?? user?.name ?? 'You';
  const email = profile.data?.email ?? user?.email ?? '';
  const initials = name
    .split(' ')
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();

  async function connectGoogle() {
    const { url } = await api<{ url: string }>('/google/oauth/url');
    const redirect = Linking.createURL('google-connected');
    await WebBrowser.openAuthSessionAsync(url, redirect);
    await google.refetch();
  }

  return (
    <Screen>
      <ScreenHeader title="Profile" subtitle="Account and reviews" />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.identity}>
          <View style={styles.avatar}>
            <Text style={styles.initials}>{initials || 'U'}</Text>
          </View>
          <Text style={styles.name}>{name}</Text>
          <Text style={styles.email}>{email}</Text>
        </View>

        <Group label="Library">
          <Row icon="book-outline" title="Notes" subtitle="Topic documents" onPress={() => navigation.navigate('Knowledge')} />
          <Row icon="create-outline" title="Journal" subtitle="Daily reflection" onPress={() => navigation.navigate('Journal')} />
          <Row
            icon="trophy-outline"
            title="Achievements"
            subtitle="Meaningful milestones"
            last
            onPress={() => navigation.navigate('Achievements')}
          />
        </Group>

        <Group label="Reviews">
          <Row icon="calendar-outline" title="Weekly" onPress={() => navigation.navigate('WeeklyReview')} />
          <Row icon="calendar-number-outline" title="Monthly" onPress={() => navigation.navigate('MonthlyReview')} />
          <Row icon="flag-outline" title="Year" last onPress={() => navigation.navigate('YearlyReview')} />
        </Group>

        <Group label="Account">
          <Row
            icon="logo-google"
            title="Google Docs"
            subtitle={
              google.data?.connected
                ? google.data.email ?? 'Connected'
                : google.data?.configured
                  ? 'Not connected'
                  : 'Not configured on server'
            }
            onPress={() => {
              if (google.data?.connected) {
                api('/google/oauth', { method: 'DELETE' }).then(() => google.refetch());
                return;
              }
              if (google.data?.configured) {
                connectGoogle();
              }
            }}
          />
          <Row
            icon="sync-outline"
            title="Sync now"
            subtitle="Flush offline activity"
            onPress={async () => {
              const result = await flushOutbox();
              Alert.alert(
                result.offline ? 'Still offline' : 'Synced',
                result.offline ? 'Will retry when you are back online.' : `Flushed ${result.flushed} item(s).`,
              );
            }}
          />
          <Row icon="server-outline" title="API" subtitle={apiUrl} last />
        </Group>

        <Group>
          <Row icon="log-out-outline" title="Sign out" destructive last onPress={() => clear()} />
        </Group>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { paddingTop: 8, paddingBottom: 40, gap: 22 },
  identity: { alignItems: 'center', paddingVertical: 8, gap: 8 },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.accentDim,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: { color: '#fff', fontSize: 24, fontWeight: '700' },
  name: { fontSize: 22, fontWeight: '700', color: colors.ink },
  email: { fontSize: 14, color: colors.muted },
});
