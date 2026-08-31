import { View, Text, StyleSheet, FlatList, Pressable, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useEffect, useState, useCallback } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Screen, Card, EmptyState } from '../components/ui';
import { useAuthStore } from '../store/authStore';
import { getWorkoutLogs } from '../services/api/workoutService';
import { WorkoutLog } from '../types';
import { Colors } from '../constants';

export default function WorkoutHistory() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const [logs, setLogs] = useState<WorkoutLog[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      setLogs(await getWorkoutLogs(user.id, 100));
    } catch {
      setLogs([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    load();
  }, [load]);

  const totalDuration = logs.reduce((a, l) => a + (l.duration_minutes || 0), 0);
  const totalCalories = logs.reduce((a, l) => a + (l.calories_burned || 0), 0);

  return (
    <Screen>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} accessibilityLabel="Back" style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={Colors.text} />
        </Pressable>
        <Text style={styles.title}>Workout History</Text>
        <View style={{ width: 40 }} />
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={Colors.primary} style={{ marginTop: 40 }} />
      ) : logs.length === 0 ? (
        <EmptyState
          icon="barbell-outline"
          title="You haven't completed a workout yet"
          message="Complete your first workout to see your history here."
          actionLabel="Browse workouts"
          onAction={() => router.replace('/(tabs)/workout')}
        />
      ) : (
        <>
          <Card style={styles.summary}>
            <Stat label="Total workouts" value={String(logs.length)} />
            <Stat label="Total time" value={`${totalDuration} min`} />
            <Stat label="Calories" value={String(totalCalories)} />
          </Card>
          <FlatList
            data={logs}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            renderItem={({ item }) => (
              <View style={styles.row}>
                <View style={styles.icon}>
                  <Ionicons name="barbell-outline" size={18} color={Colors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.name}>{item.workouts?.name ?? 'Workout'}</Text>
                  <Text style={styles.meta}>
                    {new Date(item.completed_at).toLocaleDateString()} · {item.duration_minutes} min · {item.calories_burned} kcal
                  </Text>
                </View>
                <Ionicons name="checkmark-circle" size={20} color={Colors.success} />
              </View>
            )}
          />
        </>
      )}
    </Screen>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 8, marginBottom: 16 },
  backBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: Colors.surface, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 18, fontWeight: '700', color: Colors.text },
  summary: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 16, paddingVertical: 18 },
  stat: { alignItems: 'center' },
  statValue: { fontSize: 22, fontWeight: '800', color: Colors.text },
  statLabel: { fontSize: 12, color: Colors.textSecondary, marginTop: 4 },
  listContent: { paddingBottom: 30 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: Colors.surface, borderRadius: 12, borderWidth: 1, borderColor: Colors.border, padding: 14, marginBottom: 8 },
  icon: { width: 40, height: 40, borderRadius: 10, backgroundColor: Colors.primaryLight, alignItems: 'center', justifyContent: 'center' },
  name: { fontSize: 15, fontWeight: '600', color: Colors.text },
  meta: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
});
