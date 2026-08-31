import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { showAlert } from '../../utils/alert';
import { Link, useRouter } from 'expo-router';
import { requestPasswordReset } from '../../services/api/auth';
import { Button, Field } from '../../components/ui';
import AuthScreenContainer from '../../features/auth/AuthScreenContainer';
import { Colors } from '../../constants';
import { validateEmail } from '../../utils/validation';
import { getErrorMessage } from '../../utils/helpers';

export default function ForgotPassword() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const [sent, setSent] = useState(false);

  const handleSend = async () => {
    const check = validateEmail(email);
    setError(check.message);
    if (!check.valid) return;

    setLoading(true);
    try {
      const res = await requestPasswordReset(email.trim());
      // In this local build there is no email delivery, so we surface the one-time
      // reset token directly to let the user finish the flow.
      const token = extractToken(res.reset_url);
      if (token) {
        showAlert('Reset token', `Use this token on the next screen:\n\n${token}`, [
          { text: 'Continue', onPress: () => router.replace(`/(auth)/reset-password?token=${encodeURIComponent(token)}`) },
        ]);
      } else {
        setSent(true);
      }
    } catch (e) {
      showAlert('Error', getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <AuthScreenContainer title="Check your email" subtitle="We sent you a link to reset your password.">
        <Button title="Back to Sign In" onPress={() => router.replace('/(auth)/login')} variant="lime" />
      </AuthScreenContainer>
    );
  }

  return (
    <AuthScreenContainer title="Reset your password" subtitle="Enter your email and we'll send you a reset link">
      <Field
        label="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        placeholder="you@example.com"
        error={error}
        dark
      />
      <View style={styles.spacer} />
      <Button title="Send Reset Link" onPress={handleSend} loading={loading} variant="lime" />
      <View style={styles.backRow}>
        <Link href="/(auth)/login" asChild>
          <Text style={styles.link}>{'<'} Back to sign in</Text>
        </Link>
      </View>
    </AuthScreenContainer>
  );
}

function extractToken(resetUrl?: string): string | null {
  if (!resetUrl) return null;
  const m = resetUrl.match(/[?&]token=([^&]+)/);
  return m ? decodeURIComponent(m[1]) : null;
}

const styles = StyleSheet.create({
  spacer: { height: 16 },
  backRow: { alignItems: 'center', marginTop: 16 },
  link: { color: Colors.gym.lime, fontWeight: '600', fontSize: 14 },
});
