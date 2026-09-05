import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { api, useSession } from '../../api/client';
import { Field } from '../../components/Field';
import { ErrorBanner, GhostButton, PrimaryButton, Screen, Title } from '../../components/ui';
import { space } from '../../theme';
import type { AuthUser } from '../../types';

export function RegisterScreen({ navigation }: { navigation: { goBack: () => void } }) {
  const setSession = useSession((s) => s.setSession);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit() {
    setLoading(true);
    setError(null);
    try {
      const data = await api<{ accessToken: string; refreshToken: string; user: AuthUser }>('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ name, email, password }),
      });
      await setSession(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not create account');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Screen>
      <View style={styles.form}>
        <Title>Create your Life OS</Title>
        {error ? <ErrorBanner message={error} /> : null}
        <Field value={name} onChangeText={setName} placeholder="Name" />
        <Field value={email} onChangeText={setEmail} placeholder="Email" keyboardType="email-address" />
        <Field value={password} onChangeText={setPassword} placeholder="Password (8+ characters)" secureTextEntry />
        <PrimaryButton label={loading ? 'Creating…' : 'Create account'} onPress={submit} disabled={loading} />
        <GhostButton label="I already have an account" onPress={() => navigation.goBack()} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  form: { flex: 1, justifyContent: 'center', gap: 12 },
});
