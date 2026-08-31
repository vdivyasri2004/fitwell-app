import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '../../constants';

interface BrandHeaderProps {
  title: string;
  subtitle?: string;
  icon?: keyof typeof MaterialCommunityIcons.glyphMap;
  style?: ViewStyle;
}

export default function BrandHeader({ title, subtitle, icon = 'dumbbell', style }: BrandHeaderProps) {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.glow}>
        <View style={styles.ring}>
          <MaterialCommunityIcons name={icon} size={46} color={Colors.gym.lime} />
        </View>
      </View>
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginTop: 28,
    marginBottom: 8,
  },
  glow: {
    width: 128,
    height: 128,
    borderRadius: 64,
    backgroundColor: Colors.gym.limeGlow,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ring: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 2,
    borderColor: Colors.gym.lime,
    backgroundColor: Colors.gym.bgSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 40,
    fontWeight: '900',
    color: Colors.gym.ink,
    letterSpacing: 1,
    marginTop: 16,
    textTransform: 'uppercase',
  },
  subtitle: {
    fontSize: 15,
    color: Colors.gym.inkMuted,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 22,
    paddingHorizontal: 24,
  },
});
