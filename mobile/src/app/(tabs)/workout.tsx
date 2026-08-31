import { View, Text, StyleSheet, ScrollView, Pressable, RefreshControl, ActivityIndicator } from 'react-native';
import { showAlert } from '../../utils/alert';
import { useRouter } from 'expo-router';
import { useEffect, useState, useCallback, useRef } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Screen, Card, SectionTitle, EmptyState } from '../../components/ui';
import { useAuthStore } from '../../store/authStore';
import { getAllWorkouts, getRecommendedWorkouts, getWorkoutLogs, addWorkoutLog, getWorkoutById } from '../../services/api/workoutService';
import { Workout as WorkoutType, WorkoutLog } from '../../types';
import { Colors, GLOBAL_GOALS } from '../../constants';

export default function Workout() {
  const router = useRouter();
  const profile = useAuthStore((s) => s.profile);
  const [workouts, setWorkouts] = useState<WorkoutType[]>([]);
  const [recommended, setRecommended] = useState<WorkoutType[]>([]);
  const [history, setHistory] = useState<WorkoutLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [goal, setGoal] = useState('all');
  const [filter, setFilter] = useState('all');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [all, rec, hist] = await Promise.all([
        getAllWorkouts(),
        profile ? getRecommendedWorkouts(profile.fitness_goal, 'beginner', 4) : Promise.resolve([]),
        getWorkoutLogs(useAuthStore.getState().user!.id, 10).catch(() => []),
      ]);
      setWorkouts(all);
      setRecommended(rec);
      setHistory(hist);
    } catch {
      // database empty or offline
    } finally {
      setLoading(false);
    }
  }, [profile]);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = workouts.filter((w) => {
    const goalMatch = goal === 'all' || w.goal === goal;
    const typeMatch = filter === 'all' || w.workout_type === filter;
    return goalMatch && typeMatch;
  });

  const types = Array.from(new Set(workouts.map((w) => w.workout_type)));

  return (
    <Screen>
      <Text style={styles.pageTitle}>Workout</Text>

      {loading ? (
        <ActivityIndicator size="large" color={Colors.primary} style={{ marginTop: 40 }} />
      ) : (
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <WorkoutTimer onSaved={load} library={workouts} />

          <SectionTitle style={styles.first}>Recommended for you</SectionTitle>
          {recommended.length > 0 ? (
            recommended.slice(0, 2).map((w) => (
              <Pressable key={w.id} onPress={() => router.push(`/workout-details?id=${w.id}`)}>
                <Card style={styles.recCard}>
                  <View style={styles.recIcon}>
                    <Ionicons name="barbell-outline" size={24} color={Colors.primary} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.recTitle}>{w.name}</Text>
                    <Text style={styles.recMeta}>
                      {GLOBAL_GOALS[w.goal] ?? w.goal} · {w.duration_minutes} min · {w.difficulty}
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color={Colors.textMuted} />
                </Card>
              </Pressable>
            ))
          ) : (
            <EmptyState
              icon="barbell-outline"
              title="Pick a workout to begin"
              message="Your recommended workouts will appear here based on your goal."
            />
          )}

          {history.length > 0 && (
            <>
              <SectionTitle>Recent workouts</SectionTitle>
              <Card style={styles.historyCard}>
                <View style={styles.historyRow}>
                  <View>
                    <Text style={styles.historyLabel}>Completed workouts</Text>
                    <Text style={styles.historyValue}>{history.length}</Text>
                  </View>
                  <Pressable onPress={() => router.push('/workout-history')}>
                    <Text style={styles.viewAll}>View all</Text>
                  </Pressable>
                </View>
              </Card>
            </>
          )}

          <SectionTitle>Workout Library</SectionTitle>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.typeRow}>
            <FilterChip label="All" active={filter === 'all'} onPress={() => setFilter('all')} />
            {types.map((t) => (
              <FilterChip key={t} label={t} active={filter === t} onPress={() => setFilter(t)} />
            ))}
          </ScrollView>

          {filtered.length === 0 ? (
            <EmptyState icon="barbell-outline" title="No workouts found" message="Try a different filter." />
          ) : (
            filtered.map((w) => (
              <Pressable key={w.id} onPress={() => router.push(`/workout-details?id=${w.id}`)}>
                <Card style={styles.wCard}>
                  <Text style={styles.wName}>{w.name}</Text>
                  <Text style={styles.wMeta}>
                    {w.workout_type} · {w.duration_minutes} min · {w.difficulty}
                  </Text>
                  <Text style={styles.wDesc} numberOfLines={2}>{w.description}</Text>
                </Card>
              </Pressable>
            ))
          )}
        </ScrollView>
      )}
    </Screen>
  );
}

function WorkoutTimer({ onSaved, library }: { onSaved: () => void; library: WorkoutType[] }) {
  const user = useAuthStore((s) => s.user);
  const profile = useAuthStore((s) => s.profile);
  const [seconds, setSeconds] = useState(0);
  const [running, setRunning] = useState(false);
  const [saving, setSaving] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [pick, setPick] = useState<WorkoutType | null>(null);

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => setSeconds((s) => s + 1), 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [running]);

  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  const mm = mins.toString().padStart(2, '0');
  const ss = secs.toString().padStart(2, '0');
  const durationMin = Math.max(1, Math.round((seconds / 60) * 10) / 10);
  const met = profile?.activity_level === 'very_active' ? 8 : profile?.activity_level === 'moderate' ? 6 : 5;
  const estKcal = Math.round(durationMin * met);

  const chooseWorkout = () => {
    if (library.length === 0) {
      showAlert('No workouts', 'Pick a workout from the library first.');
      return;
    }
    if (!pick) {
      setPick(library[0]);
      return;
    }
    const idx = library.findIndex((w) => w.id === pick.id);
    setPick(library[(idx + 1) % library.length]);
  };

  const finish = async () => {
    if (seconds < 10) {
      showAlert('Too short', 'Run the timer for at least 10 seconds to log a workout.');
      return;
    }
    if (!user) return;
    const w = pick ?? library[0];
    if (!w) {
      showAlert('No workout selected', 'Pick a workout from the library before logging.');
      chooseWorkout();
      return;
    }
    setSaving(true);
    try {
      await addWorkoutLog(user.id, w.id, durationMin, estKcal, `Live session ${mm}:${ss}`);
      setSeconds(0);
      setRunning(false);
      onSaved();
      showAlert('Workout saved', `Logged ${durationMin} min · ~${estKcal} kcal for "${w.name}".`);
    } catch {
      showAlert('Error', 'Could not log this workout.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <LinearGradient
      colors={[Colors.gym.bgCardHi, Colors.gym.bgCard]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.timerCard}
    >
      <View style={styles.timerTop}>
        <Text style={styles.timerTitle}>Live workout timer</Text>
        <View style={styles.timerBadge}>
          <Ionicons name="fitness" size={12} color={Colors.gym.workout} />
          <Text style={styles.timerBadgeText}>{running ? 'ON' : 'READY'}</Text>
        </View>
      </View>

      <Text style={[styles.timerClock, { color: running ? Colors.gym.lime : Colors.gym.ink }]}>{mm}:{ss}</Text>

      <View style={styles.timerMetaRow}>
        <TimerMeta label="Duration" value={`~${durationMin} min`} />
        <TimerMeta label="Est. burn" value={`~${estKcal} kcal`} color={Colors.gym.calories} />
      </View>

      <Pressable onPress={chooseWorkout} style={styles.pickRow}>
        <Ionicons name="barbell-outline" size={14} color={Colors.gym.lime} />
        <Text style={styles.pickText}>{pick ? pick.name : 'Pick a workout to log'}</Text>
        <Ionicons name="chevron-down" size={16} color={Colors.gym.inkMuted} />
      </Pressable>

      <View style={styles.timerActions}>
        {running ? (
          <Pressable style={[styles.timerBtn, { backgroundColor: Colors.gym.bg }]} onPress={() => setRunning(false)}>
            <Ionicons name="pause" size={16} color={Colors.gym.ink} />
            <Text style={[styles.timerBtnText, { color: Colors.gym.ink }]}>Pause</Text>
          </Pressable>
        ) : (
          <Pressable
            style={[styles.timerBtn, { backgroundColor: Colors.gym.lime }]}
            onPress={() => setRunning(true)}
            disabled={saving}
          >
            <Ionicons name="play" size={16} color={Colors.gym.onLime} />
            <Text style={[styles.timerBtnText, { color: Colors.gym.onLime }]}>Start</Text>
          </Pressable>
        )}
        <Pressable
          style={[styles.timerBtn, { backgroundColor: Colors.gym.bg }]}
          onPress={() => {
            setSeconds(0);
            setRunning(false);
          }}
          disabled={saving}
        >
          <Ionicons name="refresh" size={16} color={Colors.gym.inkMuted} />
          <Text style={[styles.timerBtnText, { color: Colors.gym.inkMuted }]}>Reset</Text>
        </Pressable>
        <Pressable
          style={[styles.timerBtn, { backgroundColor: Colors.gym.workout }]}
          onPress={finish}
          disabled={saving}
        >
          <Ionicons name="checkmark" size={16} color="#fff" />
          <Text style={[styles.timerBtnText, { color: '#fff' }]}>{saving ? 'Saving' : 'Finish'}</Text>
        </Pressable>
      </View>
    </LinearGradient>
  );
}

function TimerMeta({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <View style={styles.timerMeta}>
      <Text style={styles.timerMetaLabel}>{label}</Text>
      <Text style={[styles.timerMetaValue, color ? { color } : null]}>{value}</Text>
    </View>
  );
}

function FilterChip({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={[styles.chip, active && styles.chipActive]}>
      <Text style={[styles.chipText, active && styles.chipTextActive]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pageTitle: { fontSize: 24, fontWeight: '800', color: Colors.text, marginTop: 8, marginBottom: 4 },
  scroll: { paddingBottom: 30 },
  timerCard: {
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: Colors.gym.line,
    marginTop: 8,
  },
  timerTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  timerTitle: { fontSize: 15, fontWeight: '800', color: Colors.gym.ink },
  timerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: `${Colors.gym.workout}26`,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  timerBadgeText: { fontSize: 11, fontWeight: '800', color: Colors.gym.workout, letterSpacing: 1 },
  timerClock: { fontSize: 48, fontWeight: '900', textAlign: 'center', marginVertical: 14, fontVariant: ['tabular-nums'] },
  timerMetaRow: { flexDirection: 'row', gap: 10, marginBottom: 14 },
  timerMeta: { flex: 1, alignItems: 'center', backgroundColor: Colors.gym.bgCardHi, borderRadius: 12, paddingVertical: 10 },
  timerMetaLabel: { fontSize: 11, color: Colors.gym.inkMuted },
  timerMetaValue: { fontSize: 15, fontWeight: '800', color: Colors.gym.ink, marginTop: 2 },
  pickRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.gym.bg,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 14,
  },
  pickText: { flex: 1, fontSize: 13, color: Colors.gym.ink, fontWeight: '600' },
  timerActions: { flexDirection: 'row', gap: 10 },
  timerBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    borderRadius: 12,
    paddingVertical: 12,
  },
  timerBtnText: { fontWeight: '800', fontSize: 14 },
  first: { marginTop: 8 },
  recCard: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 10 },
  recIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  recTitle: { fontSize: 16, fontWeight: '700', color: Colors.text },
  recMeta: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
  historyCard: { marginBottom: 8 },
  historyRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  historyLabel: { fontSize: 13, color: Colors.textSecondary },
  historyValue: { fontSize: 24, fontWeight: '800', color: Colors.text, marginTop: 4 },
  viewAll: { color: Colors.primary, fontWeight: '600', fontSize: 14 },
  typeRow: { marginBottom: 12, flexGrow: 0 },
  chip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, borderWidth: 1.5, borderColor: Colors.border, backgroundColor: Colors.surface, marginRight: 8 },
  chipActive: { backgroundColor: Colors.primaryLight, borderColor: Colors.primary },
  chipText: { fontSize: 13, fontWeight: '600', color: Colors.textSecondary },
  chipTextActive: { color: Colors.primaryDark },
  wCard: { marginBottom: 10 },
  wName: { fontSize: 16, fontWeight: '700', color: Colors.text },
  wMeta: { fontSize: 12, color: Colors.primaryDark, marginTop: 2 },
  wDesc: { fontSize: 13, color: Colors.textSecondary, marginTop: 6, lineHeight: 19 },
});
