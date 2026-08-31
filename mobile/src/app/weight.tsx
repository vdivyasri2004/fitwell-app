import { View, Text, StyleSheet, ScrollView, Pressable, ActivityIndicator, TextInput } from 'react-native';
import { showAlert } from '../utils/alert';
import { useRouter } from 'expo-router';
import { useState, useEffect, useCallback } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Screen, Card, Button, Field, EmptyState } from '../components/ui';
import { LineChart } from '../components/ui';
import { useAuthStore } from '../store/authStore';
import {
  getWeightLogs,
  getWeightLogsRange,
  addWeightLog,
  updateWeightLog,
  deleteWeightLog,
} from '../services/api/weightService';
import { Colors } from '../constants';
import { WeightLog } from '../types';
import { todayISO, daysAgoISO } from '../utils/helpers';
import { validateWeight } from '../utils/validation';

const RANGES = [
  { label: '7D', days: 7 },
  { label: '30D', days: 30 },
  { label: '90D', days: 90 },
];

export default function Weight() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const [logs, setLogs] = useState<WeightLog[]>([]);
  const [range, setRange] = useState(30);
  const [chartPoints, setChartPoints] = useState<{ label: string; value: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [value, setValue] = useState('');
  const [editing, setEditing] = useState<WeightLog | null>(null);
  const [error, setError] = useState<string | undefined>();

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      setLogs(await getWeightLogs(user.id, 90));
    } catch {
      setLogs([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const loadChart = useCallback(async () => {
    if (!user) return;
    try {
      const data = await getWeightLogsRange(user.id, daysAgoISO(range), todayISO());
      const points = data
        .slice()
        .sort((a, b) => a.logged_at.localeCompare(b.logged_at))
        .map((w) => ({ label: w.logged_at.slice(5, 10), value: w.weight_kg }));
      setChartPoints(points);
    } catch {
      setChartPoints([]);
    }
  }, [user, range]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    loadChart();
  }, [loadChart]);

  const current = logs[0];
  const previous = logs[1];
  const weightChange = current && previous ? current.weight_kg - previous.weight_kg : null;

  const handleSave = async () => {
    const check = validateWeight(value);
    setError(check.message);
    if (!check.valid) return;
    if (!user) return;
    try {
      if (editing) {
        await updateWeightLog(editing.id, user.id, Number(value));
      } else {
        await addWeightLog(user.id, Number(value), new Date().toISOString());
      }
      setShowForm(false);
      setEditing(null);
      setValue('');
      await load();
      await loadChart();
    } catch {
      showAlert('Error', 'Could not save weight.');
    }
  };

  const handleDelete = (log: WeightLog) => {
    showAlert('Delete weight entry?', undefined, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteWeightLog(log.id, user!.id);
            await load();
            await loadChart();
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
        <Text style={styles.title}>Weight</Text>
        <Pressable onPress={() => { setEditing(null); setValue(''); setShowForm(true); setError(undefined); }} style={styles.addBtn}>
          <Ionicons name="add" size={22} color="#fff" />
        </Pressable>
      </View>

      {showForm ? (
        <Card style={styles.formCard}>
          <Text style={styles.formTitle}>{editing ? 'Edit weight' : 'Add weight'}</Text>
          <Field
            label="Weight (kg)"
            value={value}
            onChangeText={setValue}
            keyboardType="decimal-pad"
            placeholder="e.g. 70"
            error={error}
            containerStyle={styles.field}
          />
          <View style={styles.formActions}>
            <Button title="Cancel" variant="outline" onPress={() => { setShowForm(false); setEditing(null); }} style={styles.flex} />
            <Button title="Save" onPress={handleSave} style={styles.flex} />
          </View>
        </Card>
      ) : null}

      {loading ? (
        <ActivityIndicator size="large" color={Colors.primary} style={{ marginTop: 40 }} />
      ) : (
        <ScrollView showsVerticalScrollIndicator={false}>
          {current ? (
            <Card style={styles.previewCard}>
              <View style={styles.previewRow}>
                <View>
                  <Text style={styles.previewLabel}>Current weight</Text>
                  <Text style={styles.previewValue}>{current.weight_kg} kg</Text>
                  {weightChange !== null && (
                    <Text style={[styles.change, weightChange <= 0 ? styles.positive : styles.negative]}>
                      {weightChange >= 0 ? '+' : ''}{weightChange.toFixed(1)} kg since last
                    </Text>
                  )}
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={styles.previewLabel}>Previous</Text>
                  <Text style={styles.previewSub}>{previous ? `${previous.weight_kg} kg` : '—'}</Text>
                  <Text style={styles.previewDate}>{new Date(current.logged_at).toLocaleDateString()}</Text>
                </View>
              </View>
            </Card>
          ) : (
            <EmptyState
              icon="scale-outline"
              title="No weight logged yet"
              message="Log your weight for at least two days to see a trend."
              actionLabel="Log your weight"
              onAction={() => { setShowForm(true); setError(undefined); }}
            />
          )}

          {current && chartPoints.length > 0 && (
            <Card style={styles.chartCard}>
              <View style={styles.rangeRow}>
                {RANGES.map((r) => (
                  <Pressable key={r.days} onPress={() => setRange(r.days)} style={[styles.rangeBtn, range === r.days && styles.rangeBtnActive]}>
                    <Text style={[styles.rangeText, range === r.days && styles.rangeTextActive]}>{r.label}</Text>
                  </Pressable>
                ))}
              </View>
              <Text style={styles.chartTitle}>Weight trend</Text>
              <LineChart data={chartPoints} color={Colors.chart2} />
            </Card>
          )}

          <Text style={styles.sectionLabel}>History</Text>
          {logs.slice(0, 20).map((log) => (
            <View key={log.id} style={styles.row}>
              <Text style={styles.rowLabel}>{new Date(log.logged_at).toLocaleDateString()}</Text>
              <Text style={styles.rowValue}>{log.weight_kg} kg</Text>
              <View style={styles.rowActions}>
                <Pressable onPress={() => { setEditing(log); setValue(String(log.weight_kg)); setShowForm(true); setError(undefined); }} hitSlop={8}>
                  <Ionicons name="pencil-outline" size={18} color={Colors.info} />
                </Pressable>
                <Pressable onPress={() => handleDelete(log)} hitSlop={8}>
                  <Ionicons name="trash-outline" size={18} color={Colors.danger} />
                </Pressable>
              </View>
            </View>
          ))}
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
  field: { marginBottom: 16 },
  formActions: { flexDirection: 'row', gap: 10 },
  flex: { flex: 1 },
  previewCard: { marginBottom: 16 },
  previewRow: { flexDirection: 'row', justifyContent: 'space-between' },
  previewLabel: { fontSize: 13, color: Colors.textSecondary },
  previewValue: { fontSize: 28, fontWeight: '800', color: Colors.text, marginTop: 4 },
  change: { fontSize: 13, fontWeight: '600', marginTop: 4 },
  positive: { color: Colors.success },
  negative: { color: Colors.danger },
  previewSub: { fontSize: 16, fontWeight: '700', color: Colors.text, marginTop: 4 },
  previewDate: { fontSize: 12, color: Colors.textMuted, marginTop: 4 },
  chartCard: { marginBottom: 8 },
  rangeRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  rangeBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: Colors.surface, borderWidth: 1.5, borderColor: Colors.border },
  rangeBtnActive: { backgroundColor: Colors.primaryLight, borderColor: Colors.primary },
  rangeText: { fontSize: 13, fontWeight: '600', color: Colors.textSecondary },
  rangeTextActive: { color: Colors.primaryDark },
  chartTitle: { fontSize: 15, fontWeight: '700', color: Colors.text, marginBottom: 12 },
  sectionLabel: { fontSize: 15, fontWeight: '700', color: Colors.text, marginTop: 12, marginBottom: 10 },
  row: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.surface, borderRadius: 12, borderWidth: 1, borderColor: Colors.border, padding: 14, marginBottom: 8 },
  rowLabel: { flex: 1, fontSize: 14, color: Colors.text, fontWeight: '500' },
  rowValue: { fontSize: 15, fontWeight: '700', color: Colors.text, marginRight: 16 },
  rowActions: { flexDirection: 'row', gap: 12 },
});
