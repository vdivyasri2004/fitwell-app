import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { showAlert } from '../../utils/alert';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { resetPassword } from '../../services/api/auth';
import { Button, Field } from '../../components/ui';
import AuthScreenContainer from '../../features/auth/AuthScreenContainer';
import { validatePassword } from '../../utils/validation';
import { getErrorMessage } from '../../utils/helpers';

export default function ResetPassword() {
  const router = useRouter();
  const params = useLocalSearchParams<{ token?: string }>();
  const [token, setToken] = useState<string>(params.token ?? '');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ password?: string; token?: string }>({});

  const handleReset = async () => {
    const passCheck = validatePassword(password);
    setErrors({ password: passCheck.message });
    if (!passCheck.valid) return;
    if (password !== confirm) {
      setErrors({ password: 'Passwords do not match.' });
      return;
    }
    if (!token.trim()) {
      setErrors({ token: 'A reset token is required.' });
      return;
    }

    setLoading(true);
    try {
      await resetPassword(token.trim(), password);
      showAlert('Password updated', 'You can now sign in with your new password.');
      router.replace('/(auth)/login');
    } catch (e) {
      showAlert('Error', getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthScreenContainer title="Set a new password" subtitle="Choose a new password for your account">
      <Field
        label="Reset token"
        value={token}
        onChangeText={setToken}
        autoCapitalize="none"
        placeholder="Paste your reset token"
        error={errors.token}
        dark
      />
      <View style={styles.spacer} />
      <Field
        label="New password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        placeholder="At least 6 characters"
        error={errors.password}
        dark
      />
      <View style={styles.spacer} />
      <Field
        label="Confirm password"
        value={confirm}
        onChangeText={setConfirm}
        secureTextEntry
        placeholder="Re-enter password"
        error={errors.password}
        dark
      />
      <View style={styles.spacer} />
      <Button title="Update Password" onPress={handleReset} loading={loading} variant="lime" />
    </AuthScreenContainer>
  );
}

const styles = StyleSheet.create({
  spacer: { height: 16 },
});
