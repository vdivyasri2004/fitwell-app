import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { Colors } from '../../constants';

export interface ActivityRingData {
  value: number;
  target: number;
  color: string;
  label?: string;
}

interface ActivityRingsProps {
  rings: ActivityRingData[];
  size?: number;
  strokeWidth?: number;
  gap?: number;
  center?: React.ReactNode;
}

// Apple-Watch-style overlapping activity rings built from SVG circles.
export default function ActivityRings({
  rings,
  size = 160,
  strokeWidth = 14,
  gap = 6,
  center,
}: ActivityRingsProps) {
  const count = rings.length;
  const degrees = -(90 + (count - 1) * (gap / 2));
  const ringStroke = strokeWidth / (count > 1 ? 1.45 : 1);

  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size}>
        {rings.map((ring, i) => {
          // Each ring sits slightly inside the previous one so they overlap with a small gap.
          const r = (size / 2 - strokeWidth / 2) - i * ringStroke * 1.1;
          const circumference = 2 * Math.PI * r;
          const clamped = ring.target > 0 ? Math.max(0, Math.min(1, ring.value / ring.target)) : 0;
          const dashOffset = circumference * (1 - clamped);
          return (
            <Circle
              key={`track-${i}`}
              stroke={ring.color + '2E'}
              fill="none"
              cx={size / 2}
              cy={size / 2}
              r={r}
              strokeWidth={ringStroke}
            />
          );
        })}
        {rings.map((ring, i) => {
          const r = (size / 2 - strokeWidth / 2) - i * ringStroke * 1.1;
          const circumference = 2 * Math.PI * r;
          const clamped = ring.target > 0 ? Math.max(0, Math.min(1, ring.value / ring.target)) : 0;
          const dashOffset = circumference * (1 - clamped);
          return (
            <Circle
              key={`fg-${i}`}
              stroke={ring.color}
              fill="none"
              cx={size / 2}
              cy={size / 2}
              r={r}
              strokeWidth={ringStroke}
              strokeDasharray={circumference}
              strokeDashoffset={dashOffset}
              strokeLinecap="round"
              rotation={`${degrees + i * gap}`}
              origin={`${size / 2}, ${size / 2}`}
            />
          );
        })}
      </Svg>
      {center && (
        <View style={[styles.center, { width: size, height: size }]}>{center}</View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    position: 'absolute',
    top: 0,
    left: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export { Colors };
