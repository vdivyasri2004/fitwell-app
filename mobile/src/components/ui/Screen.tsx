import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle, StyleProp, ScrollView } from 'react-native';
import { Colors } from '../../constants';
import { SafeAreaView } from 'react-native-safe-area-context';

interface ScreenProps {
  children: React.ReactNode;
  style?: ViewStyle;
  padding?: boolean;
}

export default function Screen({ children, style, padding = true }: ScreenProps) {
  return (
    <SafeAreaView style={[styles.safe, { paddingHorizontal: padding ? 16 : 0 }, style]} edges={['top']}>
      {children}
    </SafeAreaView>
  );
}

interface CardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

export function Card({ children, style }: CardProps) {
  return <View style={[styles.card, style]}>{children}</View>;
}

interface SectionTitleProps {
  children: React.ReactNode;
  style?: TextStyle;
}

export function SectionTitle({ children, style }: SectionTitleProps) {
  return <Text style={[styles.sectionTitle, style]}>{children}</Text>;
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  card: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.text,
    marginTop: 20,
    marginBottom: 10,
  },
});
