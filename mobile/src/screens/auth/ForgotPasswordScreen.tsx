import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { api } from '../../api/client';
import { Field } from '../../components/Field';
import { ErrorBanner, GhostButton, Muted, PrimaryButton, Screen, Title } from '../../components/ui';

export function ForgotPasswordScreen({ navigation }: { navigation: { goBack: () => void } }) {
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [password, setPassword] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function send() {
    setError(null);
    try {
      const data = await api<{ sent: boolean; token?: string }>('/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email }),
      });
      setSent(true);
      if (data.token) {
        setToken(data.token);
        setMessage('Development reset token is ready. Set a new password below.');
      } else {
        setMessage('If that email exists, a reset token was created.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not send reset');
    }
  }

  async function reset() {
    setError(null);
    try {
      await api('/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({ email, token, password }),
      });
      navigation.goBack();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not reset password');
    }
  }

  return (
    <Screen>
      <View style={styles.form}>
        <Title>Reset password</Title>
        {error ? <ErrorBanner message={error} /> : null}
        {message ? <Muted>{message}</Muted> : null}
        <Field value={email} onChangeText={setEmail} placeholder="Email" keyboardType="email-address" />
        {!sent ? <PrimaryButton label="Send reset" onPress={send} /> : null}
        {sent ? (
          <>
            <Field value={token} onChangeText={setToken} placeholder="Reset token" />
            <Field value={password} onChangeText={setPassword} placeholder="New password" secureTextEntry />
            <PrimaryButton label="Update password" onPress={reset} />
          </>
        ) : null}
        <GhostButton label="Back to sign in" onPress={() => navigation.goBack()} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  form: { flex: 1, justifyContent: 'center', gap: 12 },
});
