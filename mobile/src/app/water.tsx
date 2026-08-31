import { View, Text, StyleSheet, ScrollView, Pressable, TextInput, ActivityIndicator } from 'react-native';
import { showAlert } from '../utils/alert';
import { useRouter } from 'expo-router';
import { useState, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Screen, Card, ProgressRing, Button } from '../components/ui';
import { useAuthStore } from '../store/authStore';
import { useTodayData } from '../hooks/useTodayData';
import { addWaterLog, deleteWaterLog, getWaterLogsForDay } from '../services/api/waterService';
import { Colors } from '../constants';
import { todayISO } from '../utils/helpers';
import { WaterLog } from '../types';

const QUICK_AMOUNTS = [250, 500, 750, 1000];

export default function Water() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const profile = useAuthStore((s) => s.profile);
  const today = useTodayData();
  const target = profile?.water_target_ml ?? 2000;
  const [custom, setCustom] = useState('');
  const [entries, setEntries] = useState<WaterLog[]>([]);
  const [loadingEntries, setLoadingEntries] = useState(false);

  const loadEntries = async () => {
    if (!user) return;
    setLoadingEntries(true);
    try {
      setEntries(await getWaterLogsForDay(user.id, todayISO()));
    } catch {
      setEntries([]);
    } finally {
      setLoadingEntries(false);
    }
  };

  const handleAdd = async (amount: number) => {
    if (!user || amount <= 0) return;
    try {
      await addWaterLog(user.id, amount, new Date().toISOString());
      await today.refresh();
      await loadEntries();
    } catch {
      showAlert('Error', 'Could not log water.');
    }
  };

  const handleCustom = async () => {
    const amount = Number(custom);
    if (!amount || amount <= 0) {
      showAlert('Invalid amount', 'Please enter a positive amount in ml.');
      return;
    }
    await handleAdd(amount);
    setCustom('');
  };

  const handleDelete = (logId: string) => {
    showAlert('Delete water entry?', undefined, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteWaterLog(logId, user!.id);
            await today.refresh();
            await loadEntries();
          } catch {
            showAlert('Error', 'Could not delete entry.');
          }
        },
      },
    ]);
  };

  const progress = target > 0 ? today.water / target : 0;

  useEffect(() => {
    loadEntries();
  }, []);

  return (
    <Screen>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} accessibilityLabel="Back" style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={Colors.text} />
        </Pressable>
        <Text style={styles.title}>Water</Text>
        <View style={{ width: 40 }} />
      </View>

      <Card style={styles.ringCard}>
        <ProgressRing
          progress={progress}
          size={150}
          color={Colors.chart3}
          label={`${Math.round(today.water)} ml`}
          sublabel={`of ${target} ml`}
        />
        <Text style={styles.ringHint}>
          {today.water >= target ? 'Great job staying hydrated!' : `Drink ${Math.max(0, Math.round(target - today.water))} ml more.`}
        </Text>
      </Card>

      <Text style={styles.sectionLabel}>Quick add</Text>
      <View style={styles.quickRow}>
        {QUICK_AMOUNTS.map((amt) => (
          <Pressable key={amt} onPress={() => handleAdd(amt)} style={styles.quickBtn} accessibilityRole="button">
            <Ionicons name="water-outline" size={20} color={Colors.primary} />
            <Text style={styles.quickBtnText}>{amt >= 1000 ? `${amt / 1000} L` : `${amt} ml`}</Text>
          </Pressable>
        ))}
      </View>

      <Text style={styles.sectionLabel}>Custom amount</Text>
      <View style={styles.customRow}>
        <TextInput
          value={custom}
          onChangeText={setCustom}
          keyboardType="number-pad"
          placeholder="Amount in ml"
          placeholderTextColor={Colors.textMuted}
          style={styles.customInput}
        />
        <Button title="Add" onPress={handleCustom} style={styles.customBtn} />
      </View>

      <Text style={styles.sectionLabel}>Today's entries ({entries.length})</Text>
      {loadingEntries ? (
        <ActivityIndicator color={Colors.primary} style={{ marginTop: 10 }} />
      ) : entries.length === 0 ? (
        <Text style={styles.emptyText}>Add some water to see today's entries.</Text>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false}>
          {entries.map((e) => (
            <View key={e.id} style={styles.entry}>
              <View style={styles.entryIcon}>
                <Ionicons name="water-outline" size={18} color={Colors.chart3} />
              </View>
              <Text style={styles.entryAmount}>{e.amount_ml} ml</Text>
              <Text style={styles.entryTime}>{new Date(e.logged_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
              <Pressable onPress={() => handleDelete(e.id)} hitSlop={10} accessibilityLabel="Delete">
                <Ionicons name="trash-outline" size={18} color={Colors.danger} />
              </Pressable>
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
  ringCard: { alignItems: 'center', paddingVertical: 24 },
  ringHint: { color: Colors.textSecondary, fontSize: 13, marginTop: 12, textAlign: 'center' },
  sectionLabel: { fontSize: 15, fontWeight: '700', color: Colors.text, marginTop: 20, marginBottom: 10 },
  quickRow: { flexDirection: 'row', gap: 10 },
  quickBtn: {
    flex: 1,
    alignItems: 'center',
    gap: 6,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  quickBtnText: { fontSize: 13, fontWeight: '600', color: Colors.text },
  customRow: { flexDirection: 'row', gap: 10 },
  customInput: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 13,
    backgroundColor: Colors.surface,
    fontSize: 16,
    color: Colors.text,
  },
  customBtn: { paddingHorizontal: 28 },
  emptyText: { color: Colors.textMuted, textAlign: 'center', marginTop: 10, fontSize: 13 },
  entry: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 14,
    marginBottom: 8,
  },
  entryIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  entryAmount: { flex: 1, fontSize: 15, fontWeight: '600', color: Colors.text },
  entryTime: { fontSize: 13, color: Colors.textSecondary },
});
