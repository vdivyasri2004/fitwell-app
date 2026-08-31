import { View, Text, StyleSheet, FlatList, Pressable, ActivityIndicator } from 'react-native';
import { showAlert } from '../../utils/alert';
import { useRouter } from 'expo-router';
import { useEffect, useState, useCallback } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Screen, Card, EmptyState } from '../../components/ui';
import { getRecentFoodLogs, deleteFoodLog } from '../../services/api/foodLogService';
import { useAuthStore } from '../../store/authStore';
import { Colors } from '../../constants';
import { FoodLog } from '../../types';
import { formatDateTime } from '../../utils/helpers';

export default function FoodHistory() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const [logs, setLogs] = useState<FoodLog[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await getRecentFoodLogs(user.id, 50);
      setLogs(data);
    } catch {
      setLogs([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    load();
  }, [load]);

  const handleDelete = (log: FoodLog) => {
    showAlert('Delete entry?', 'This will remove the entry from your log.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteFoodLog(log.id, user!.id);
            load();
          } catch {
            showAlert('Error', 'Could not delete this entry.');
          }
        },
      },
    ]);
  };

  const totalCalories = logs.reduce((a, f) => a + f.calories, 0);

  return (
    <Screen>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} accessibilityLabel="Back" style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={Colors.text} />
        </Pressable>
        <Text style={styles.title}>Food History</Text>
        <View style={{ width: 40 }} />
      </View>

      <Card style={styles.summary}>
        <Text style={styles.summaryLabel}>Entries shown</Text>
        <Text style={styles.summaryValue}>{logs.length} meals · {totalCalories} kcal</Text>
      </Card>

      {loading ? (
        <ActivityIndicator size="large" color={Colors.primary} style={{ marginTop: 40 }} />
      ) : logs.length === 0 ? (
        <EmptyState
          icon="time-outline"
          title="No food logged yet"
          message="Your food history will appear here as you log meals."
          actionLabel="Log a meal"
          onAction={() => router.push('/food/search')}
        />
      ) : (
        <FlatList
          data={logs}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.row}>
              <View style={styles.info}>
                <Text style={styles.name}>{item.food_items?.name ?? 'Food'}</Text>
                <Text style={styles.meta}>
                  {formatDateTime(item.logged_at)} · {item.meal_type} · {item.quantity} serving · {item.calories} kcal
                </Text>
              </View>
              <Pressable onPress={() => handleDelete(item)} hitSlop={10} accessibilityLabel="Delete">
                <Ionicons name="trash-outline" size={18} color={Colors.danger} />
              </Pressable>
            </View>
          )}
          contentContainerStyle={styles.listContent}
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 8, marginBottom: 16 },
  backBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: Colors.surface, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 18, fontWeight: '700', color: Colors.text },
  summary: { marginBottom: 16 },
  summaryLabel: { fontSize: 13, color: Colors.textSecondary },
  summaryValue: { fontSize: 18, fontWeight: '700', color: Colors.text, marginTop: 4 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 14,
    marginBottom: 8,
  },
  info: { flex: 1, paddingRight: 12 },
  name: { fontSize: 15, fontWeight: '600', color: Colors.text },
  meta: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
  listContent: { paddingBottom: 30 },
});
