import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Colors } from '../../constants';

interface ProgressBarProps {
  progress: number;
  color?: string;
  trackColor?: string;
  height?: number;
  label?: string;
  style?: ViewStyle;
}

export default function ProgressBar({
  progress,
  color = Colors.primary,
  trackColor = Colors.border,
  height = 10,
  label,
  style,
}: ProgressBarProps) {
  const clamped = Math.max(0, Math.min(1, progress));
  return (
    <View style={style}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={[styles.track, { height, backgroundColor: trackColor }]}>
        <View style={{ width: `${clamped * 100}%`, height, backgroundColor: color, borderRadius: height / 2 }} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: 6,
    fontWeight: '500',
  },
  track: {
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: Colors.border,
    width: '100%',
  },
});
