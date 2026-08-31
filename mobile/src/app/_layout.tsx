import { useEffect } from 'react';
import { Stack } from 'expo-router';
import Head from 'expo-router/head';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, View, Platform } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useAuthStore } from '../store/authStore';
import { Colors } from '../constants';

function FaviconLinks() {
  if (Platform.OS !== 'web') return null;
  return (
    <Head>
      <link rel="icon" type="image/x-icon" href="/favicon.ico" />
      <link rel="icon" type="image/png" sizes="512x512" href="/favicon.png" />
      <link rel="apple-touch-icon" sizes="512x512" href="/favicon.png" />
      <title>FitWell</title>
      <meta name="theme-color" content="#0B0B0F" />
    </Head>
  );
}

export default function RootLayout() {
  const { initialize, initialized, loading } = useAuthStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  if (!initialized || loading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.background }}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar style="dark" />
      <FaviconLinks />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="onboarding/index" />
      </Stack>
    </GestureHandlerRootView>
  );
}
