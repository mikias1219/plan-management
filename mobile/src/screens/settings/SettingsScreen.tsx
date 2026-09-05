import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';
import { useQuery } from '@tanstack/react-query';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { api, apiUrl, useSession } from '../../api/client';
import { flushOutbox } from '../../offline/outbox';
import { Card, GhostButton, Muted, PrimaryButton, Screen, SectionLabel, Title } from '../../components/ui';
import { colors, space } from '../../theme';

export function SettingsScreen() {
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

  async function connectGoogle() {
    const { url } = await api<{ url: string }>('/google/oauth/url');
    const redirect = Linking.createURL('google-connected');
    await WebBrowser.openAuthSessionAsync(url, redirect);
    await google.refetch();
  }

  return (
    <Screen>
      <Title>Settings</Title>
      <Muted>{profile.data?.name ?? user?.name}</Muted>
      <Muted>{profile.data?.email ?? user?.email}</Muted>
      <Muted>API {apiUrl}</Muted>
      <View style={styles.stack}>
        <Card>
          <SectionLabel>Google Docs</SectionLabel>
          <Muted>
            {google.data?.connected
              ? `Connected as ${google.data.email}`
              : google.data?.configured
                ? 'Not connected'
                : 'Add Google credentials on the server to enable Docs'}
          </Muted>
          {google.data?.connected ? (
            <GhostButton label="Disconnect" onPress={() => api('/google/oauth', { method: 'DELETE' }).then(() => google.refetch())} />
          ) : (
            <PrimaryButton label="Connect Google" onPress={connectGoogle} />
          )}
        </Card>
        <Card>
          <SectionLabel>Sync</SectionLabel>
          <PrimaryButton
            label="Sync now"
            onPress={async () => {
              const result = await flushOutbox();
              Alert.alert(result.offline ? 'Still offline' : 'Synced', result.offline ? 'Will retry when you are back online.' : `Flushed ${result.flushed} item(s).`);
            }}
          />
        </Card>
      </View>
      <Pressable onPress={() => clear()} style={styles.signOut}>
        <Text style={styles.signOutLabel}>Sign out</Text>
      </Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  stack: { marginTop: space.lg, gap: space.md },
  signOut: { marginTop: space.xl, alignItems: 'center' },
  signOutLabel: { color: colors.error, fontWeight: '700' },
});
