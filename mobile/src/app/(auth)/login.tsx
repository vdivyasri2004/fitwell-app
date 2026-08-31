import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { login } from '../../services/api/auth';
import { useAuthStore } from '../../store/authStore';
import { Button, Field } from '../../components/ui';
import AuthScreenContainer from '../../features/auth/AuthScreenContainer';
import { Colors } from '../../constants';
import { validateEmail, validatePassword } from '../../utils/validation';
import { getErrorMessage } from '../../utils/helpers';
import { showAlert } from '../../utils/alert';

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const handleLogin = async () => {
    const emailCheck = validateEmail(email);
    const passCheck = validatePassword(password);
    setErrors({ email: emailCheck.message, password: passCheck.message });
    if (!emailCheck.valid || !passCheck.valid) return;

    setLoading(true);
    try {
      await login(email.trim(), password);
      // Refresh the store from the stored token so the app recognizes the session.
      await useAuthStore.getState().initialize();
      router.replace('/(tabs)');
    } catch (e) {
      showAlert('Login failed', getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthScreenContainer title="Welcome back" subtitle="Sign in to continue your wellness journey">
      <Field
        label="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        placeholder="you@example.com"
        error={errors.email}
        dark
      />
      <View style={styles.spacer} />
      <Field
        label="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        placeholder="Your password"
        error={errors.password}
        dark
      />
      <View style={styles.spacer} />
      <Button title="Sign In" onPress={handleLogin} loading={loading} variant="lime" />
      <View style={styles.links}>
        <Link href="/(auth)/forgot-password" asChild>
          <Text style={styles.link}>Forgot password?</Text>
        </Link>
      </View>
      <View style={styles.registerRow}>
        <Text style={styles.muted}>New to FitWell? </Text>
        <Link href="/(auth)/register" asChild>
          <Text style={styles.link}>Create an account</Text>
        </Link>
      </View>
    </AuthScreenContainer>
  );
}

const styles = StyleSheet.create({
  spacer: { height: 16 },
  links: { alignItems: 'center', marginTop: 16 },
  link: { color: Colors.gym.lime, fontWeight: '600', fontSize: 14 },
  registerRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 12 },
  muted: { color: Colors.gym.inkMuted, fontSize: 14 },
});
