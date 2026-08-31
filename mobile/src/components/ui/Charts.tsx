import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Dimensions, ViewStyle } from 'react-native';
import Svg, { Polyline, Circle, Line, Rect } from 'react-native-svg';
import { Colors } from '../../constants';

export interface ChartPoint {
  label: string;
  value: number;
}

interface LineChartProps {
  data: ChartPoint[];
  height?: number;
  color?: string;
  showDots?: boolean;
  style?: ViewStyle;
}

export function LineChart({ data, height = 180, color = Colors.primary, showDots = true, style }: LineChartProps) {
  const width = Dimensions.get('window').width - 64;
  const { points } = useMemo(() => {
    const values = data.map((d) => d.value);
    const max = Math.max(...values, 1) * 1.1;
    const pad = 10;
    const stepX = values.length > 1 ? (width - pad * 2) / (values.length - 1) : 0;
    const pts = data.map((d, i) => {
      const x = pad + i * stepX;
      const y = height - pad - (d.value / max) * (height - pad * 2);
      return { x, y, ...d };
    });
    return { points: pts };
  }, [data, width, height]);

  if (data.length === 0) {
    return <View style={[styles.emptyBox, { height }]}><Text style={styles.emptyText}>No data to chart yet.</Text></View>;
  }

  const polyline = points.map((p) => `${p.x},${p.y}`).join(' ');
  const midY = height / 2;

  return (
    <View style={[styles.container, style]}>
      <Svg width={width} height={height}>
        <Line x1={10} y1={midY} x2={width - 10} y2={midY} stroke={Colors.border} strokeWidth={1} strokeDasharray="4,4" />
        <Polyline points={polyline} fill="none" stroke={color} strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" />
        {showDots && points.map((p, i) => (
          <Circle key={i} cx={p.x} cy={p.y} r={4} fill={Colors.surface} stroke={color} strokeWidth={2.5} />
        ))}
      </Svg>
      <View style={styles.labelsRow}>
        {points.filter((_, i) => i % Math.ceil(points.length / 5) === 0 || i === points.length - 1).map((p, i) => (
          <Text key={i} style={styles.axisLabel} numberOfLines={1}>{p.label}</Text>
        ))}
      </View>
    </View>
  );
}

interface BarChartProps {
  data: ChartPoint[];
  height?: number;
  color?: string;
  style?: ViewStyle;
}

export function BarChart({ data, height = 180, color = Colors.primary, style }: BarChartProps) {
  const width = Dimensions.get('window').width - 64;
  const { bars } = useMemo(() => {
    const values = data.map((d) => d.value);
    const max = Math.max(...values, 1) * 1.1;
    const pad = 10;
    const gap = 6;
    const barW = (width - pad * 2 - gap * (Math.max(data.length, 1) - 1)) / Math.max(data.length, 1);
    const bs = data.map((d, i) => {
      const x = pad + i * (barW + gap);
      const h = (d.value / max) * (height - pad * 2);
      const y = height - pad - h;
      return { x, y, w: barW, h, ...d };
    });
    return { bars: bs };
  }, [data, width, height]);

  if (data.length === 0) {
    return <View style={[styles.emptyBox, { height }]}><Text style={styles.emptyText}>No data to chart yet.</Text></View>;
  }

  return (
    <View style={[styles.container, style]}>
      <Svg width={width} height={height}>
        {bars.map((b, i) => (
          <Rect key={i} x={b.x} y={b.y} width={b.w} height={b.h} fill={color} rx={4} />
        ))}
      </Svg>
      <View style={styles.labelsRow}>
        {bars.filter((_, i) => i % Math.ceil(bars.length / 5) === 0 || i === bars.length - 1).map((b, i) => (
          <Text key={i} style={styles.axisLabel} numberOfLines={1}>{b.label}</Text>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  labelsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  axisLabel: {
    fontSize: 10,
    color: Colors.textMuted,
  },
  emptyBox: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    backgroundColor: Colors.surface,
  },
  emptyText: {
    color: Colors.textMuted,
    fontSize: 13,
  },
});
