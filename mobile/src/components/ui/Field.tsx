import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TextInputProps, ViewStyle } from 'react-native';
import { Colors } from '../../constants';

interface FieldProps extends TextInputProps {
  label?: string;
  error?: string;
  containerStyle?: ViewStyle;
  icon?: React.ReactNode;
  dark?: boolean;
}

export default function Field({ label, error, containerStyle, icon, dark = false, style, ...rest }: FieldProps) {
  const [focused, setFocused] = useState(false);
  return (
    <View style={containerStyle}>
      {label && <Text style={[styles.label, dark && styles.labelDark]}>{label}</Text>}
      <View
        style={[
          styles.wrap,
          dark && styles.wrapDark,
          focused && (dark ? styles.wrapFocusedDark : styles.wrapFocused),
          error && styles.wrapError,
        ]}
      >
        {icon}
        <TextInput
          accessibilityLabel={label}
          style={[styles.input, dark && styles.inputDark, style]}
          placeholderTextColor={dark ? Colors.gym.inkMuted : Colors.textMuted}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          {...rest}
        />
      </View>
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 6,
    fontWeight: '500',
  },
  labelDark: {
    color: Colors.gym.inkMuted,
  },
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    backgroundColor: Colors.surface,
    gap: 8,
  },
  wrapDark: {
    backgroundColor: Colors.gym.bgSoft,
    borderColor: Colors.gym.line,
  },
  wrapFocused: {
    borderColor: Colors.primary,
  },
  wrapFocusedDark: {
    borderColor: Colors.gym.lime,
  },
  wrapError: {
    borderColor: Colors.danger,
  },
  input: {
    flex: 1,
    paddingVertical: 13,
    fontSize: 16,
    color: Colors.text,
  },
  inputDark: {
    color: Colors.gym.ink,
  },
  error: {
    color: Colors.danger,
    fontSize: 12,
    marginTop: 4,
  },
});
