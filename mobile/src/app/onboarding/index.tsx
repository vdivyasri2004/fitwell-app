import React from 'react';
import { Redirect } from 'expo-router';
import { useAuthStore } from '../../store/authStore';
import OnboardingForm from '../../features/onboarding/OnboardingForm';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StyleSheet } from 'react-native';
import { Colors } from '../../constants';

export default function Onboarding() {
  const { user } = useAuthStore();

  if (!user) {
    return <Redirect href="/(auth)/welcome" />;
  }

  return (
    <SafeAreaView style={styles.safe}>
      <OnboardingForm />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.background,
  },
});
