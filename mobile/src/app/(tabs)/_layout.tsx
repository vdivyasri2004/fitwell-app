import { Tabs } from 'expo-router';
import { useAuthStore } from '../../store/authStore';
import { Redirect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants';

function TabIcon({ name, color, size = 24 }: { name: keyof typeof Ionicons.glyphMap; color: string; size?: number }) {
  return <Ionicons name={name} color={color} size={size} />;
}

export default function TabsLayout() {
  const { user, profile, loading } = useAuthStore();

  if (loading) {
    return null;
  }

  if (!user) {
    return <Redirect href="/(auth)/welcome" />;
  }

  if (user && !profile?.onboarded) {
    return <Redirect href="/onboarding" />;
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.gym.lime,
        tabBarInactiveTintColor: Colors.gym.inkDim,
        tabBarStyle: {
          backgroundColor: Colors.gym.bgSoft,
          borderTopColor: Colors.gym.line,
        },
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Home', tabBarIcon: ({ color, size }) => <TabIcon name="home-outline" color={color as string} size={size} /> }} />
      <Tabs.Screen name="nutrition" options={{ title: 'Nutrition', tabBarIcon: ({ color, size }) => <TabIcon name="restaurant-outline" color={color as string} size={size} /> }} />
      <Tabs.Screen name="workout" options={{ title: 'Workout', tabBarIcon: ({ color, size }) => <TabIcon name="barbell-outline" color={color as string} size={size} /> }} />
      <Tabs.Screen name="progress" options={{ title: 'Progress', tabBarIcon: ({ color, size }) => <TabIcon name="stats-chart-outline" color={color as string} size={size} /> }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile', tabBarIcon: ({ color, size }) => <TabIcon name="person-outline" color={color as string} size={size} /> }} />
    </Tabs>
  );
}
