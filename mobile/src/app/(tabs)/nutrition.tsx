import { View, Text, StyleSheet, ScrollView, Pressable, RefreshControl, FlatList } from 'react-native';
import { showAlert } from '../../utils/alert';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Screen, Card, SectionTitle, EmptyState, ActivityRings } from '../../components/ui';
import { useTodayData } from '../../hooks/useTodayData';
import { useCountUp } from '../../hooks/useCountUp';
import { deleteFoodLog } from '../../services/api/foodLogService';
import { useAuthStore } from '../../store/authStore';
import { Colors, MEAL_TYPES } from '../../constants';
import { FoodLog, MealType } from '../../types';

const MEAL_LABELS: Record<string, string> = {
  breakfast: 'Breakfast',
  lunch: 'Lunch',
  dinner: 'Dinner',
  snack: 'Snack',
};

export default function Nutrition() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const profile = useAuthStore((s) => s.profile);
  const { foodLogs, calories, protein, carbs, fat, loading, refresh } = useTodayData();
  const calorieTarget = profile?.calorie_target ?? 0;

  const handleDelete = (log: FoodLog) => {
    showAlert('Delete meal?', `Remove ${log.food_items?.name ?? 'this item'} from your log?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteFoodLog(log.id, user!.id);
            refresh();
          } catch {
            showAlert('Error', 'Could not delete this item.');
          }
        },
      },
    ]);
  };

  const grouped = MEAL_TYPES.map((m) => ({
    meal: m.value as MealType,
    label: m.label,
    items: foodLogs.filter((f) => f.meal_type === m.value),
  })).filter((g) => g.items.length > 0);

  return (
    <Screen>
      <Text style={styles.pageTitle}>Nutrition</Text>

      <LinearGradient
        colors={[Colors.gym.bgCardHi, Colors.gym.bgCard]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.totalsCard}
      >
        <View style={styles.totalRow2}>
          <ActivityRings
            size={150}
            strokeWidth={15}
            rings={[{ value: calories, target: calorieTarget || 1, color: Colors.gym.calories }]}
            center={
              <View style={styles.ringCenter}>
                <Text style={styles.totalValue}>{useCountUp(Math.round(calories))}</Text>
                <Text style={styles.ringCenterLabel}>kcal</Text>
                <Text style={styles.ringCenterTarget}>of {calorieTarget}</Text>
              </View>
            }
          />
          <View style={styles.totalSide}>
            <Text style={styles.totalLabel}>Calories today</Text>
            <Text style={styles.totalHint}>
              {Math.max(0, Math.round((calorieTarget || 1) - calories))} kcal left
            </Text>
            <MacroLegend protein={protein} carbs={carbs} fat={fat} />
          </View>
        </View>
      </LinearGradient>

      <View style={styles.macrosRow}>
        <MacroStat label="Protein" value={protein} color={Colors.gym.protein} unit="g" />
        <MacroStat label="Carbs" value={carbs} color={Colors.gym.water} unit="g" />
        <MacroStat label="Fat" value={fat} color={Colors.gym.steps} unit="g" />
      </View>

      <View style={styles.actionsRow}>
        <Pressable style={styles.primaryAction} onPress={() => router.push('/food/search')}>
          <Ionicons name="add" size={20} color="#fff" />
          <Text style={styles.primaryActionText}>Log Food</Text>
        </Pressable>
        <Pressable style={styles.secondaryAction} onPress={() => router.push('/food/history')}>
          <Ionicons name="time-outline" size={18} color={Colors.primary} />
          <Text style={styles.secondaryActionText}>History</Text>
        </Pressable>
      </View>

      <SectionTitle>Today's meals</SectionTitle>
      {loading ? (
        <Text style={styles.loadingText}>Loading...</Text>
      ) : foodLogs.length === 0 ? (
        <EmptyState
          icon="restaurant-outline"
          title="You haven't logged any meals today"
          message="Log your first meal to track your calories and macros."
          actionLabel="Log a meal"
          onAction={() => router.push('/food/search')}
        />
      ) : (
        <FlatList
          data={grouped}
          keyExtractor={(g) => g.meal}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <View style={styles.mealGroup}>
              <Text style={styles.mealGroupTitle}>
                {item.label} · {Math.round(item.items.reduce((a, f) => a + f.calories, 0))} kcal
              </Text>
              {item.items.map((log) => (
                <Card key={log.id} style={styles.foodCard}>
                  <View style={styles.foodInfo}>
                    <Text style={styles.foodName}>{log.food_items?.name ?? 'Food'}</Text>
                    <Text style={styles.foodMeta}>
                      {log.quantity} serving(s) · {log.calories} kcal · {log.protein_g}g protein
                    </Text>
                  </View>
                  <Pressable onPress={() => handleDelete(log)} accessibilityLabel="Delete" hitSlop={10}>
                    <Ionicons name="trash-outline" size={18} color={Colors.danger} />
                  </Pressable>
                </Card>
              ))}
            </View>
          )}
        />
      )}
    </Screen>
  );
}

function MacroStat({ label, value, color, unit = 'g' }: { label: string; value: number; color: string; unit?: string }) {
  const animated = useCountUp(Math.round(value));
  return (
    <LinearGradient
      colors={[Colors.gym.bgCard, Colors.gym.bg]}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={styles.macro}
    >
      <View style={[styles.macroDot, { backgroundColor: color, shadowColor: color, shadowOpacity: 0.6, shadowRadius: 4 }]} />
      <Text style={styles.macroValue}>{animated}{unit}</Text>
      <Text style={styles.macroLabel}>{label}</Text>
    </LinearGradient>
  );
}

function MacroLegend({ protein, carbs, fat }: { protein: number; carbs: number; fat: number }) {
  const rows = [
    { label: 'Protein', value: Math.round(protein), unit: 'g', color: Colors.gym.protein },
    { label: 'Carbs', value: Math.round(carbs), unit: 'g', color: Colors.gym.water },
    { label: 'Fat', value: Math.round(fat), unit: 'g', color: Colors.gym.steps },
  ];
  return (
    <View style={styles.legendCol}>
      {rows.map((r) => (
        <View key={r.label} style={styles.legendRow}>
          <View style={[styles.legendDot, { backgroundColor: r.color }]} />
          <Text style={styles.legendLabel}>{r.label}</Text>
          <Text style={[styles.legendValue, { color: r.color }]}>{r.value}{r.unit}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  pageTitle: { fontSize: 24, fontWeight: '800', color: Colors.text, marginTop: 8, marginBottom: 16 },
  totalsCard: {
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: Colors.gym.line,
  },
  totalRow2: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  ringCenter: { alignItems: 'center' },
  totalValue: { fontSize: 28, fontWeight: '900', color: Colors.gym.ink, letterSpacing: 0.5 },
  ringCenterLabel: { fontSize: 12, color: Colors.gym.inkMuted, marginTop: 2 },
  ringCenterTarget: { fontSize: 11, color: Colors.gym.inkDim, marginTop: 2 },
  totalSide: { flex: 1, marginLeft: 18 },
  totalLabel: { fontSize: 15, fontWeight: '700', color: Colors.gym.ink },
  totalHint: { fontSize: 13, color: Colors.gym.inkMuted, marginTop: 4, marginBottom: 12 },
  legendCol: { gap: 10 },
  legendRow: { flexDirection: 'row', alignItems: 'center' },
  legendDot: { width: 10, height: 10, borderRadius: 5, marginRight: 8 },
  legendLabel: { flex: 1, fontSize: 13, color: Colors.gym.inkMuted },
  legendValue: { fontSize: 13, fontWeight: '700' },
  macrosRow: { flexDirection: 'row', gap: 10, marginTop: 14 },
  macro: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.gym.line,
  },
  macroDot: { width: 8, height: 8, borderRadius: 4, marginBottom: 6 },
  macroValue: { fontSize: 15, fontWeight: '800', color: Colors.gym.ink },
  macroLabel: { fontSize: 11, color: Colors.gym.inkMuted, marginTop: 2 },
  actionsRow: { flexDirection: 'row', gap: 10, marginTop: 16 },
  primaryAction: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: Colors.primary,
    borderRadius: 14,
    paddingVertical: 14,
  },
  primaryActionText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  secondaryAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.surface,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  secondaryActionText: { color: Colors.primary, fontWeight: '700', fontSize: 14 },
  loadingText: { color: Colors.textMuted, textAlign: 'center', marginTop: 20 },
  listContent: { paddingBottom: 30 },
  mealGroup: { marginBottom: 12 },
  mealGroupTitle: { fontSize: 15, fontWeight: '700', color: Colors.text, marginBottom: 8 },
  foodCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  foodInfo: { flex: 1, paddingRight: 12 },
  foodName: { fontSize: 15, fontWeight: '600', color: Colors.text },
  foodMeta: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
});
