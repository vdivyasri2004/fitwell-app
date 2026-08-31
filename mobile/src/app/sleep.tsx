import { View, Text, StyleSheet, ScrollView, Pressable, ActivityIndicator } from 'react-native';
import { showAlert } from '../utils/alert';
import { useRouter } from 'expo-router';
import { useState, useEffect, useCallback } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Screen, Card, Button, Field, EmptyState } from '../components/ui';
import { useAuthStore } from '../store/authStore';
import {
  addSleepLog,
  getSleepLogs,
  updateSleepLog,
  deleteSleepLog,
  averageSleepDuration,
} from '../services/api/sleepService';
import { Colors } from '../constants';
import { SleepLog, SleepQuality } from '../types';
import { sleepDurationMinutes, formatMinutes } from '../utils/helpers';
import { validateSleepTimes } from '../utils/validation';

const QUALITIES: { value: SleepQuality; label: string }[] = [
  { value: 'excellent', label: 'Excellent' },
  { value: 'good', label: 'Good' },
  { value: 'fair', label: 'Fair' },
  { value: 'poor', label: 'Poor' },
];

const QUALITY_COLOR: Record<string, string> = {
  excellent: Colors.success,
  good: Colors.chart3,
  fair: Colors.warning,
  poor: Colors.danger,
};

export default function Sleep() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const profile = useAuthStore((s) => s.profile);
  const goal = profile?.sleep_goal_minutes ?? 480;
  const [logs, setLogs] = useState<SleepLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<SleepLog | null>(null);
  const [bedtime, setBedtime] = useState('');
  const [wakeTime, setWakeTime] = useState('');
  const [quality, setQuality] = useState<SleepQuality | null>(null);
  const [notes, setNotes] = useState('');
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState<string | undefined>();

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      setLogs(await getSleepLogs(user.id, 30));
    } catch {
      setLogs([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    setDuration(sleepDurationMinutes(bedtime, wakeTime));
  }, [bedtime, wakeTime]);

  const weekly = averageSleepDuration(logs.slice(0, 7));
  const lastNight = logs[0];

  const handleSave = async () => {
    const check = validateSleepTimes(bedtime, wakeTime);
    setError(check.message);
    if (!check.valid) return;
    if (!user) return;
    const data = {
      bedtime,
      wake_time: wakeTime,
      duration_minutes: duration,
      sleep_quality: quality,
      notes: notes.trim() || null,
    };
    try {
      if (editing) {
        await updateSleepLog(editing.id, user.id, data);
      } else {
        await addSleepLog(user.id, data);
      }
      setShowForm(false);
      setEditing(null);
      setBedtime('');
      setWakeTime('');
      setQuality(null);
      setNotes('');
      await load();
    } catch {
      showAlert('Error', 'Could not save sleep entry.');
    }
  };

  const handleDelete = (log: SleepLog) => {
    showAlert('Delete sleep entry?', undefined, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteSleepLog(log.id, user!.id);
            await load();
          } catch {
            showAlert('Error', 'Could not delete entry.');
          }
        },
      },
    ]);
  };

  return (
    <Screen>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} accessibilityLabel="Back" style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={Colors.text} />
        </Pressable>
        <Text style={styles.title}>Sleep</Text>
        <Pressable onPress={() => { setEditing(null); setBedtime(''); setWakeTime(''); setQuality(null); setNotes(''); setShowForm(true); setError(undefined); }} style={styles.addBtn}>
          <Ionicons name="add" size={22} color="#fff" />
        </Pressable>
      </View>

      {showForm && (
        <Card style={styles.formCard}>
          <Text style={styles.formTitle}>{editing ? 'Edit sleep' : 'Log sleep'}</Text>
          <View style={styles.timeRow}>
            <Field label="Bedtime (HH:MM)" value={bedtime} onChangeText={setBedtime} placeholder="22:30" keyboardType="numbers-and-punctuation" containerStyle={styles.timeField} />
            <Field label="Wake (HH:MM)" value={wakeTime} onChangeText={setWakeTime} placeholder="06:30" keyboardType="numbers-and-punctuation" containerStyle={styles.timeField} />
          </View>
          {error && <Text style={styles.errorText}>{error}</Text>}
          <Text style={styles.durationText}>Duration: {formatMinutes(duration)}</Text>
          <Text style={styles.subLabel}>Sleep quality</Text>
          <View style={styles.qualityRow}>
            {QUALITIES.map((q) => (
              <Pressable
                key={q.value}
                onPress={() => setQuality(q.value)}
                style={[styles.qualityChip, quality === q.value && { borderColor: QUALITY_COLOR[q.value], backgroundColor: `${QUALITY_COLOR[q.value]}22` }]}
              >
                <Text style={[styles.qualityText, quality === q.value && { color: Colors.primaryDark, fontWeight: '700' }]}>{q.label}</Text>
              </Pressable>
            ))}
          </View>
          <Field label="Notes (optional)" value={notes} onChangeText={setNotes} placeholder="How did you sleep?" containerStyle={styles.field} />
          <View style={styles.formActions}>
            <Button title="Cancel" variant="outline" onPress={() => setShowForm(false)} style={styles.flex} />
            <Button title="Save" onPress={handleSave} style={styles.flex} />
          </View>
        </Card>
      )}

      {loading ? (
        <ActivityIndicator size="large" color={Colors.primary} style={{ marginTop: 40 }} />
      ) : (
        <ScrollView showsVerticalScrollIndicator={false}>
          {lastNight ? (
            <Card style={styles.previewCard}>
              <View style={styles.previewRow}>
                <View>
                  <Text style={styles.previewLabel}>Last night</Text>
                  <Text style={styles.previewValue}>{formatMinutes(lastNight.duration_minutes)}</Text>
                  {lastNight.sleep_quality && (
                    <Text style={[styles.qualityBadge, { color: QUALITY_COLOR[lastNight.sleep_quality] }]}>
                      {lastNight.sleep_quality}
                    </Text>
                  )}
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={styles.previewLabel}>Goal</Text>
                  <Text style={styles.previewSub}>{formatMinutes(goal)}</Text>
                  <Text style={styles.previewDate}>Weekly avg {formatMinutes(weekly)}</Text>
                </View>
              </View>
            </Card>
          ) : (
            <EmptyState
              icon="bed-outline"
              title="Log your sleep to start tracking your recovery"
              message="Enter your bedtime and wake time to track your sleep duration."
              actionLabel="Log sleep"
              onAction={() => { setShowForm(true); setError(undefined); }}
            />
          )}

          <Text style={styles.sectionLabel}>History</Text>
          {logs.length === 0 && lastNight === undefined ? (
            <Text style={styles.emptyText}>No sleep entries yet.</Text>
          ) : (
            logs.slice(0, 20).map((log) => (
              <View key={log.id} style={styles.row}>
                <View style={styles.rowInfo}>
                  <Text style={styles.rowLabel}>{new Date(log.created_at).toLocaleDateString()} · {log.bedtime}–{log.wake_time}</Text>
                  <Text style={styles.rowSub}>{formatMinutes(log.duration_minutes)}{log.sleep_quality ? ` · ${log.sleep_quality}` : ''}</Text>
                </View>
                <View style={styles.rowActions}>
                  <Pressable onPress={() => { setEditing(log); setBedtime(log.bedtime); setWakeTime(log.wake_time); setQuality(log.sleep_quality); setNotes(log.notes ?? ''); setShowForm(true); setError(undefined); }} hitSlop={8}>
                    <Ionicons name="pencil-outline" size={18} color={Colors.info} />
                  </Pressable>
                  <Pressable onPress={() => handleDelete(log)} hitSlop={8}>
                    <Ionicons name="trash-outline" size={18} color={Colors.danger} />
                  </Pressable>
                </View>
              </View>
            ))
          )}
        </ScrollView>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 8, marginBottom: 16 },
  backBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: Colors.surface, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 18, fontWeight: '700', color: Colors.text },
  addBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center' },
  formCard: { marginBottom: 16 },
  formTitle: { fontSize: 17, fontWeight: '700', color: Colors.text, marginBottom: 16 },
  timeRow: { flexDirection: 'row', gap: 10 },
  timeField: { flex: 1 },
  errorText: { color: Colors.danger, fontSize: 12, marginTop: 8 },
  durationText: { fontSize: 14, fontWeight: '600', color: Colors.primaryDark, marginTop: 12 },
  subLabel: { fontSize: 14, fontWeight: '600', color: Colors.text, marginTop: 16, marginBottom: 8 },
  qualityRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  qualityChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1.5, borderColor: Colors.border, backgroundColor: Colors.surface },
  qualityText: { fontSize: 13, color: Colors.textSecondary },
  field: { marginTop: 16 },
  formActions: { flexDirection: 'row', gap: 10, marginTop: 16 },
  flex: { flex: 1 },
  previewCard: { marginBottom: 16 },
  previewRow: { flexDirection: 'row', justifyContent: 'space-between' },
  previewLabel: { fontSize: 13, color: Colors.textSecondary },
  previewValue: { fontSize: 26, fontWeight: '800', color: Colors.text, marginTop: 4 },
  qualityBadge: { fontSize: 13, fontWeight: '600', marginTop: 4, textTransform: 'capitalize' },
  previewSub: { fontSize: 16, fontWeight: '700', color: Colors.text, marginTop: 4 },
  previewDate: { fontSize: 12, color: Colors.textMuted, marginTop: 4 },
  sectionLabel: { fontSize: 15, fontWeight: '700', color: Colors.text, marginTop: 12, marginBottom: 10 },
  emptyText: { color: Colors.textMuted, textAlign: 'center', marginTop: 10, fontSize: 13 },
  row: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.surface, borderRadius: 12, borderWidth: 1, borderColor: Colors.border, padding: 14, marginBottom: 8 },
  rowInfo: { flex: 1 },
  rowLabel: { fontSize: 14, fontWeight: '600', color: Colors.text },
  rowSub: { fontSize: 13, color: Colors.textSecondary, marginTop: 2 },
  rowActions: { flexDirection: 'row', gap: 12 },
});
