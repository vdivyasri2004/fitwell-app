import { View, Text, StyleSheet, ScrollView, Pressable, ActivityIndicator } from 'react-native';
import { showAlert } from '../utils/alert';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useState, useEffect, useCallback } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Screen, Card, Button } from '../components/ui';
import { useAuthStore } from '../store/authStore';
import { getWorkoutById, getWorkoutExercises, addWorkoutLog } from '../services/api/workoutService';
import { Workout, WorkoutExercise } from '../types';
import { Colors, GLOBAL_GOALS } from '../constants';

export default function WorkoutDetails() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const user = useAuthStore((s) => s.user);
  const [workout, setWorkout] = useState<Workout | null>(null);
  const [exercises, setExercises] = useState<WorkoutExercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(false);
  const [doneSets, setDoneSets] = useState<Record<string, number>>({});

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const [w, ex] = await Promise.all([getWorkoutById(id), getWorkoutExercises(id)]);
      setWorkout(w);
      setExercises(ex);
    } catch {
      setWorkout(null);
      setExercises([]);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  const handleComplete = () => {
    showAlert('Complete workout?', `Log ${workout?.name} as completed?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Complete',
        onPress: async () => {
          if (!user || !workout) return;
          setCompleting(true);
          try {
            const estimatedCalories = exercises.length * 12 + workout.duration_minutes * 3;
            await addWorkoutLog(user.id, workout.id, workout.duration_minutes, estimatedCalories);
            showAlert('Great job!', `${workout.name} completed.`); 
            router.back();
          } catch {
            showAlert('Error', 'Could not record your workout.');
          } finally {
            setCompleting(false);
          }
        },
      },
    ]);
  };

  if (loading) {
    return (
      <Screen>
        <ActivityIndicator size="large" color={Colors.primary} style={{ marginTop: 60 }} />
      </Screen>
    );
  }

  if (!workout) {
    return (
      <Screen>
        <Text style={styles.notFound}>Workout not found.</Text>
      </Screen>
    );
  }

  return (
    <Screen>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} accessibilityLabel="Back" style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={Colors.text} />
        </Pressable>
        <Text style={styles.title}>Workout</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Card style={styles.hero}>
          <View style={styles.heroIcon}>
            <Ionicons name="barbell-outline" size={32} color={Colors.primary} />
          </View>
          <Text style={styles.name}>{workout.name}</Text>
          <Text style={styles.meta}>
            {GLOBAL_GOALS[workout.goal] ?? workout.goal} · {workout.workout_type} · {workout.difficulty} · ~{workout.duration_minutes} min
          </Text>
          <Text style={styles.desc}>{workout.description}</Text>
        </Card>

        {exercises.length > 0 && (
          <>
            <Text style={styles.sectionLabel}>Exercises ({exercises.length})</Text>
            {exercises.map((ex, idx) => {
              const planned = ex.sets ?? 1;
              const done = doneSets[ex.id] ?? 0;
              const complete = done >= planned;
              return (
              <Card key={ex.id} style={styles.exCard}>
                <View style={styles.exHeader}>
                  <View style={[{ backgroundColor: complete ? Colors.gym.lime : Colors.primaryLight }, styles.exNum]}>
                    <Text style={[styles.exNumText, { color: complete ? Colors.gym.onLime : Colors.primaryDark }]}>
                      {complete ? <Ionicons name="checkmark" size={14} color={Colors.gym.onLime} /> : idx + 1}
                    </Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.exName, complete && { color: Colors.gym.inkMuted, textDecorationLine: 'line-through' }]}>{ex.exercises?.name ?? 'Exercise'}</Text>
                    <Text style={styles.exMeta}>
                      {ex.exercises?.muscle_group} · {ex.exercises?.difficulty}
                    </Text>
                  </View>
                </View>
                <Text style={styles.exDetail}>
                  {ex.exercises?.equipment ? `Equipment: ${ex.exercises.equipment}\n` : ''}
                  {ex.sets ? `${ex.sets} sets` : ''}{ex.reps ? ` × ${ex.reps} reps` : ''}{ex.duration_seconds ? ` · ${ex.duration_seconds}s` : ''}{ex.rest_seconds ? ` · rest ${ex.rest_seconds}s` : ''}
                </Text>
                <View style={styles.setTrack}>
                  <Text style={styles.setTrackLabel}>{done}/{planned} sets done</Text>
                  <View style={styles.setRow}>
                    {Array.from({ length: planned }, (_, i) => (
                      <Pressable
                        key={i}
                        accessibilityLabel={`Set ${i + 1}`}
                        onPress={() =>
                          setDoneSets((prev) => {
                            const cur = prev[ex.id] ?? 0;
                            const next = i < cur ? i : i === cur ? i + 1 : cur;
                            return { ...prev, [ex.id]: next };
                          })
                        }
                        style={[styles.setCell, i < done && { backgroundColor: Colors.gym.lime, borderColor: Colors.gym.lime }]}
                      >
                        <Text style={[styles.setCellText, i < done && { color: Colors.gym.onLime }]}>
                          {i < done ? <Ionicons name="checkmark" size={16} color={Colors.gym.onLime} /> : i + 1}
                        </Text>
                      </Pressable>
                    ))}
                    {done > 0 && done < planned && (
                      <Pressable
                        accessibilityLabel="Clear sets"
                        onPress={() => setDoneSets((prev) => ({ ...prev, [ex.id]: 0 }))}
                        style={styles.setReset}
                      >
                        <Ionicons name="refresh" size={16} color={Colors.gym.inkMuted} />
                      </Pressable>
                    )}
                  </View>
                </View>
                {ex.exercises?.instructions && (
                  <Text style={styles.exInstructions}>{ex.exercises.instructions}</Text>
                )}
              </Card>
              );
            })}
          </>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <Button title={`Complete Workout`} onPress={handleComplete} loading={completing} icon={<Ionicons name="checkmark" size={18} color="#fff" />} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 8, marginBottom: 16 },
  backBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: Colors.surface, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 18, fontWeight: '700', color: Colors.text },
  scroll: { paddingBottom: 120 },
  hero: { alignItems: 'flex-start', marginBottom: 8 },
  heroIcon: { width: 56, height: 56, borderRadius: 14, backgroundColor: Colors.primaryLight, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  name: { fontSize: 22, fontWeight: '800', color: Colors.text },
  meta: { fontSize: 13, color: Colors.primaryDark, marginTop: 6, fontWeight: '600' },
  desc: { fontSize: 14, color: Colors.textSecondary, marginTop: 10, lineHeight: 21 },
  sectionLabel: { fontSize: 16, fontWeight: '700', color: Colors.text, marginTop: 20, marginBottom: 10 },
  exCard: { marginBottom: 10 },
  exHeader: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  exNum: { width: 28, height: 28, borderRadius: 14, backgroundColor: Colors.primaryLight, alignItems: 'center', justifyContent: 'center' },
  exNumText: { fontSize: 14, fontWeight: '700', color: Colors.primaryDark },
  exName: { fontSize: 15, fontWeight: '600', color: Colors.text },
  exMeta: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
  exDetail: { fontSize: 13, color: Colors.textSecondary, marginTop: 10, lineHeight: 19 },
  exInstructions: { fontSize: 13, color: Colors.textSecondary, marginTop: 8, lineHeight: 19, fontStyle: 'italic' },
  setTrack: { marginTop: 14, paddingTop: 12, borderTopWidth: 1, borderTopColor: Colors.gym.line },
  setTrackLabel: { fontSize: 12, fontWeight: '700', color: Colors.gym.inkMuted, marginBottom: 10 },
  setRow: { flexDirection: 'row', alignItems: 'center' },
  setCell: {
    width: 40,
    height: 40,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: Colors.gym.line,
    backgroundColor: Colors.gym.bgCardHi,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  setCellText: { fontSize: 14, fontWeight: '800', color: Colors.gym.inkMuted },
  setReset: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginLeft: 'auto' },
  notFound: { textAlign: 'center', marginTop: 40, color: Colors.textMuted, fontSize: 15 },
  footer: { position: 'absolute', left: 16, right: 16, bottom: 16 },
});
