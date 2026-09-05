import { useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, View } from 'react-native';
import { api, useSession } from '../../api/client';
import { Field } from '../../components/Field';
import { ErrorBanner, GhostButton, PrimaryButton, Screen, Title } from '../../components/ui';
import { space } from '../../theme';
import type { AuthUser } from '../../types';

export function LoginScreen({ navigation }: { navigation: { navigate: (name: string) => void } }) {
  const setSession = useSession((s) => s.setSession);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit() {
    setLoading(true);
    setError(null);
    try {
      const data = await api<{ accessToken: string; refreshToken: string; user: AuthUser }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      await setSession(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not sign in');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Screen>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.wrap}>
        <View style={styles.header}>
          <Title>Welcome back</Title>
        </View>
        {error ? <ErrorBanner message={error} /> : null}
        <View style={styles.form}>
          <Field value={email} onChangeText={setEmail} placeholder="Email" keyboardType="email-address" />
          <Field value={password} onChangeText={setPassword} placeholder="Password" secureTextEntry />
          <PrimaryButton label={loading ? 'Signing in…' : 'Sign in'} onPress={submit} disabled={loading} />
          <GhostButton label="Create account" onPress={() => navigation.navigate('Register')} />
          <GhostButton label="Forgot password" onPress={() => navigation.navigate('ForgotPassword')} />
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, justifyContent: 'center' },
  header: { marginBottom: space.lg },
  form: { gap: space.md },
});
