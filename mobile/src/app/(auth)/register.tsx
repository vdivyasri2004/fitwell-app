import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { showAlert } from '../../utils/alert';
import { Link, useRouter } from 'expo-router';
import { register } from '../../services/api/auth';
import { useAuthStore } from '../../store/authStore';
import { Button, Field } from '../../components/ui';
import AuthScreenContainer from '../../features/auth/AuthScreenContainer';
import { Colors } from '../../constants';
import { validateName, validateEmail, validatePassword } from '../../utils/validation';
import { getErrorMessage } from '../../utils/helpers';

export default function Register() {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; email?: string; password?: string }>({});

  const handleRegister = async () => {
    const nameCheck = validateName(fullName);
    const emailCheck = validateEmail(email);
    const passCheck = validatePassword(password);
    setErrors({ name: nameCheck.message, email: emailCheck.message, password: passCheck.message });
    if (!nameCheck.valid || !emailCheck.valid || !passCheck.valid) return;

    setLoading(true);
    try {
      const user = await register(email.trim(), password, fullName.trim());
      if (!user) return;
      // Registration creates a logged-in session; sync the store and start onboarding.
      await useAuthStore.getState().initialize();
      router.replace('/onboarding');
    } catch (e) {
      showAlert('Registration failed', getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthScreenContainer title="Create your account" subtitle="Start tracking your fitness in minutes">
      <Field
        label="Full name"
        value={fullName}
        onChangeText={setFullName}
        placeholder="Your full name"
        error={errors.name}
        dark
      />
      <View style={styles.spacer} />
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
        placeholder="At least 6 characters"
        error={errors.password}
        dark
      />
      <View style={styles.spacer} />
      <Button title="Create Account" onPress={handleRegister} loading={loading} variant="lime" />
      <View style={styles.loginRow}>
        <Text style={styles.muted}>Already have an account? </Text>
        <Link href="/(auth)/login" asChild>
          <Text style={styles.link}>Sign in</Text>
        </Link>
      </View>
    </AuthScreenContainer>
  );
}

const styles = StyleSheet.create({
  spacer: { height: 16 },
  loginRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 16 },
  link: { color: Colors.gym.lime, fontWeight: '600', fontSize: 14 },
  muted: { color: Colors.gym.inkMuted, fontSize: 14 },
});
