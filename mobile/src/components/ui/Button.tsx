import React from 'react';
import {
  Pressable,
  Text,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { Colors } from '../../constants';

interface ButtonProps {
  title: string;
  onPress?: (event: any) => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'lime';
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: React.ReactNode;
}

export default function Button({
  title,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
  style,
  textStyle,
  icon,
}: ButtonProps) {
  const isDisabled = disabled || loading;

  const bgColor =
    variant === 'primary'
      ? Colors.primary
      : variant === 'lime'
      ? Colors.gym.lime
      : variant === 'secondary'
      ? Colors.primaryLight
      : variant === 'outline'
      ? 'transparent'
      : variant === 'ghost'
      ? 'transparent'
      : Colors.danger;

  const textColor =
    variant === 'primary' || variant === 'lime'
      ? Colors.gym.onLime
      : variant === 'danger'
      ? '#FFFFFF'
      : variant === 'secondary'
      ? Colors.primaryDark
      : variant === 'outline'
      ? Colors.gym.lime
      : Colors.textSecondary;

  const border =
    variant === 'outline' ? { borderWidth: 1.5, borderColor: Colors.gym.lime } : undefined;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={title}
      disabled={isDisabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        { backgroundColor: bgColor, opacity: pressed ? 0.85 : isDisabled ? 0.6 : 1 },
        border,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={textColor} />
      ) : (
        <>
          {icon}
          <Text style={[styles.text, { color: textColor }, textStyle]}>{title}</Text>
        </>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 20,
    minHeight: 50,
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
  },
});
