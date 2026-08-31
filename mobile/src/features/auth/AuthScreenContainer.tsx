import React from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors, DISCLAIMER } from '../../constants';

interface Props {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  logo?: boolean;
}

export default function AuthScreenContainer({ title, subtitle, children, footer, logo = true }: Props) {
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.glare} />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          {logo && (
            <View style={styles.logoWrap}>
              <MaterialCommunityIcons name="dumbbell" size={30} color={Colors.gym.lime} />
              <Text style={styles.logoText}>FitWell</Text>
            </View>
          )}
          <Text style={styles.title}>{title}</Text>
          {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
          <View style={styles.content}>{children}</View>
          {footer && <View style={styles.footer}>{footer}</View>}
          <Text style={styles.disclaimer}>{DISCLAIMER}</Text>
        </ScrollView>
      </KeyboardAvoidingView>
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
    left: -60,
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: Colors.gym.limeGlow,
  },
  scroll: {
    flexGrow: 1,
    padding: 20,
    justifyContent: 'center',
  },
  logoWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 24,
  },
  logoText: {
    fontSize: 30,
    fontWeight: '900',
    color: Colors.gym.ink,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: Colors.gym.ink,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    color: Colors.gym.inkMuted,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 22,
  },
  content: {
    marginTop: 28,
  },
  footer: {
    marginTop: 20,
    alignItems: 'center',
  },
  disclaimer: {
    fontSize: 11,
    color: Colors.gym.inkMuted,
    textAlign: 'center',
    marginTop: 28,
    lineHeight: 16,
  },
});
