import React from 'react';
import { View, Text, StyleSheet, Pressable, ViewStyle, DimensionValue } from 'react-native';
import { Colors } from '../../constants';

export interface Option {
  label: string;
  value: string;
  description?: string;
}

interface OptionSelectProps {
  options: Option[];
  value?: string;
  onChange: (value: string) => void;
  multi?: boolean;
  selectedValues?: string[];
  columns?: number;
  style?: ViewStyle;
}

export default function OptionSelect({
  options,
  value,
  onChange,
  multi = false,
  selectedValues = [],
  columns = 1,
  style,
}: OptionSelectProps) {
  const isSelected = (opt: Option) => (multi ? selectedValues.includes(opt.value) : value === opt.value);

  const toggle = (opt: Option) => {
    if (multi) {
      const next = isSelected(opt)
        ? selectedValues.filter((v) => v !== opt.value)
        : [...selectedValues, opt.value];
      onChange(next.join(','));
    } else {
      onChange(opt.value);
    }
  };

  const width: DimensionValue = columns > 1 ? `${100 / columns - 4}%` : '100%';

  return (
    <View style={[styles.grid, { flexDirection: columns > 1 ? 'row' : 'column' }, style]}>
      {options.map((opt) => {
        const selected = isSelected(opt);
        return (
          <Pressable
            key={opt.value}
            accessibilityRole={multi ? 'checkbox' : 'radio'}
            accessibilityState={{ selected }}
            accessibilityLabel={opt.label}
            onPress={() => toggle(opt)}
            style={[styles.option, { width }, selected && styles.optionSelected]}
          >
            <View style={[styles.dot, selected && styles.dotSelected]} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.label, selected && styles.labelSelected]}>{opt.label}</Text>
              {opt.description && <Text style={styles.description}>{opt.description}</Text>}
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    gap: 8,
    flexWrap: 'wrap',
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
    gap: 12,
  },
  optionSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryLight,
  },
  dot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.text,
  },
  labelSelected: {
    color: Colors.primaryDark,
  },
  description: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
});
