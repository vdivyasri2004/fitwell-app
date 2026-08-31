import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Link, Redirect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '../../constants';
import { Button } from '../../components/ui';
import { useAuthStore } from '../../store/authStore';
import { isApiConfigured } from '../../services/api/client';

const FEATURES: { icon: keyof typeof MaterialCommunityIcons.glyphMap; label: string }[] = [
  { icon: 'fire', label: 'Smart calorie targets' },
  { icon: 'dumbbell', label: 'Workout plans' },
  { icon: 'whistle', label: 'Daily tracking' },
  { icon: 'chart-line', label: 'Progress insights' },
];

export default function Welcome() {
  const user = useAuthStore((s) => s.user);

  if (user) {
    return <Redirect href="/(tabs)" />;
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.glare} />
      <View style={styles.content}>
        <View style={styles.hero}>
          <View style={styles.glow}>
            <View style={styles.iconRing}>
              <MaterialCommunityIcons name="dumbbell" size={52} color={Colors.gym.lime} />
            </View>
          </View>
          <Text style={styles.eyebrow}>TRAIN SMART · LIVE STRONG</Text>
          <Text style={styles.appName}>FitWell</Text>
          <Text style={styles.tagline}>
            Your all-in-one fitness & wellness companion to build stronger habits, every day.
          </Text>

          <View style={styles.features}>
            {FEATURES.map((f) => (
              <View key={f.label} style={styles.featureChip}>
                <MaterialCommunityIcons name={f.icon} size={16} color={Colors.gym.lime} />
                <Text style={styles.featureText}>{f.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {!isApiConfigured && (
          <View style={styles.warningBox}>
            <Text style={styles.warningText}>
              Backend not configured. Set EXPO_PUBLIC_API_URL in the .env file to enable sign-up and sign-in.
            </Text>
          </View>
        )}

        <View style={styles.actions}>
          <Link href="/(auth)/register" asChild>
            <Button title="Get Started" variant="lime" />
          </Link>
          <Link href="/(auth)/login" asChild>
            <Button title="I Already Have an Account" variant="outline" />
          </Link>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.gym.bg,
  },
  glare: {
    position: 'absolute',
    top: -80,
    right: -60,
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: Colors.gym.limeGlow,
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    padding: 24,
  },
  hero: {
    alignItems: 'center',
    marginTop: 48,
  },
  glow: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: Colors.gym.limeGlow,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconRing: {
    width: 112,
    height: 112,
    borderRadius: 56,
    borderWidth: 2,
    borderColor: Colors.gym.lime,
    backgroundColor: Colors.gym.bgSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  eyebrow: {
    marginTop: 22,
    color: Colors.gym.lime,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 3,
  },
  appName: {
    fontSize: 44,
    fontWeight: '900',
    color: Colors.gym.ink,
    letterSpacing: 1,
    marginTop: 6,
    textTransform: 'uppercase',
  },
  tagline: {
    fontSize: 16,
    color: Colors.gym.inkMuted,
    textAlign: 'center',
    marginTop: 12,
    lineHeight: 24,
    paddingHorizontal: 10,
  },
  features: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
    marginTop: 26,
  },
  featureChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    backgroundColor: Colors.gym.bgSoft,
    borderWidth: 1,
    borderColor: Colors.gym.line,
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  featureText: {
    color: Colors.gym.inkMuted,
    fontSize: 12.5,
    fontWeight: '600',
  },
  warningBox: {
    backgroundColor: '#3A2E12',
    borderRadius: 12,
    padding: 14,
    marginTop: 24,
  },
  warningText: {
    color: '#FCD34D',
    fontSize: 13,
    lineHeight: 19,
  },
  actions: {
    gap: 12,
    marginBottom: 12,
  },
});

