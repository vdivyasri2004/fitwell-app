import { View, Text, StyleSheet, ScrollView, TextInput, Pressable, ActivityIndicator } from 'react-native';
import { showAlert } from '../../utils/alert';
import { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Screen, Button, Field } from '../../components/ui';
import { searchFoods } from '../../services/api/foodService';
import { addFoodLog } from '../../services/api/foodLogService';
import { FoodItem, MealType } from '../../types';
import { Colors } from '../../constants';
import { useAuthStore } from '../../store/authStore';
import { MEAL_TYPES } from '../../constants';
import { validateQuantity } from '../../utils/validation';
import { todayISO } from '../../utils/helpers';

export default function FoodSearch() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const [query, setQuery] = useState('');
  const [foods, setFoods] = useState<FoodItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<FoodItem | null>(null);
  const [quantity, setQuantity] = useState('1');
  const [mealType, setMealType] = useState<MealType>('breakfast');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const delay = setTimeout(async () => {
      setLoading(true);
      try {
        const results = await searchFoods(query, 50);
        setFoods(results);
      } catch {
        setFoods([]);
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => clearTimeout(delay);
  }, [query]);

  const handleLog = async () => {
    if (!user || !selected) return;
    const qCheck = validateQuantity(quantity);
    if (!qCheck.valid) {
      showAlert('Invalid quantity', qCheck.message);
      return;
    }
    const qty = Number(quantity);
    setSaving(true);
    try {
      await addFoodLog(user.id, {
        food_item_id: selected.id,
        meal_type: mealType,
        quantity: qty,
        calories: Math.round(selected.calories * qty),
        protein_g: Math.round(selected.protein_g * qty * 10) / 10,
        carbs_g: Math.round(selected.carbs_g * qty * 10) / 10,
        fat_g: Math.round(selected.fat_g * qty * 10) / 10,
        logged_at: new Date().toISOString(),
      });
      setSelected(null);
      setQuantity('1');
      setQuery('');
      showAlert('Logged!', `${selected.name} added to your meals.`);
      router.back();
    } catch {
      showAlert('Error', 'Could not log this food. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Screen style={styles.safe}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} accessibilityLabel="Back" style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={Colors.text} />
        </Pressable>
        <Text style={styles.title}>Log Food</Text>
        <View style={{ width: 40 }} />
      </View>

      <Field
        value={query}
        onChangeText={setQuery}
        placeholder="Search foods (e.g. idli, paneer, oats)"
        containerStyle={styles.search}
        icon={<Ionicons name="search" size={20} color={Colors.textMuted} />}
        autoCapitalize="none"
      />

      {loading ? (
        <ActivityIndicator size="large" color={Colors.primary} style={styles.loader} />
      ) : selected ? (
        <View style={styles.logForm}>
          <Text style={styles.sectionTitle}>{selected.name}</Text>
          <Text style={styles.sectionSub}>
            Per serving ({selected.serving_size} {selected.serving_unit}): {selected.calories} kcal · {selected.protein_g}g protein · {selected.carbs_g}g carbs · {selected.fat_g}g fat
          </Text>

          <Text style={styles.label}>Meal type</Text>
          <View style={styles.mealRow}>
            {MEAL_TYPES.map((m) => (
              <Pressable
                key={m.value}
                onPress={() => setMealType(m.value as MealType)}
                style={[styles.mealChip, mealType === m.value && styles.mealChipActive]}
              >
                <Text style={[styles.mealChipText, mealType === m.value && styles.mealChipTextActive]}>{m.label}</Text>
              </Pressable>
            ))}
          </View>

          <Field
            label={`Servings (${selected.serving_unit})`}
            value={quantity}
            onChangeText={setQuantity}
            keyboardType="decimal-pad"
            containerStyle={styles.quantity}
          />

          <View style={styles.estimatedCard}>
            <Text style={styles.estimatedLabel}>Estimated totals</Text>
            <Text style={styles.estimatedValue}>{(selected.calories * Number(quantity || 0)).toFixed(0)} kcal · {(selected.protein_g * Number(quantity || 0)).toFixed(1)}g protein</Text>
          </View>

          <Button title="Add to Meals" onPress={handleLog} loading={saving} />
          <Pressable onPress={() => setSelected(null)} style={styles.cancelRow}>
            <Text style={styles.cancelText}>Choose another food</Text>
          </Pressable>
        </View>
      ) : (
        <>
          {foods.length === 0 ? (
            <Text style={styles.noResults}>
              {query ? 'No foods match your search.' : 'Search for a food to begin logging.'}
            </Text>
          ) : (
            <ScrollView contentContainerStyle={styles.list} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
              {foods.map((food) => (
                <Pressable key={food.id} onPress={() => setSelected(food)} style={styles.foodRow}>
                  <View style={styles.foodIcon}>
                    <Ionicons name="nutrition-outline" size={20} color={Colors.primary} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.foodName}>{food.name}</Text>
                    <Text style={styles.foodMeta}>
                      {food.category} · {food.calories} kcal · {food.protein_g}g protein
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
                </Pressable>
              ))}
            </ScrollView>
          )}
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  backBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: Colors.surface, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 18, fontWeight: '700', color: Colors.text },
  search: { marginBottom: 8 },
  loader: { marginTop: 40 },
  list: { paddingBottom: 30 },
  foodRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    backgroundColor: Colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 8,
  },
  foodIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  foodName: { fontSize: 15, fontWeight: '600', color: Colors.text },
  foodMeta: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
  noResults: { color: Colors.textMuted, textAlign: 'center', marginTop: 40, fontSize: 14 },
  logForm: { marginTop: 12 },
  sectionTitle: { fontSize: 20, fontWeight: '700', color: Colors.text },
  sectionSub: { fontSize: 13, color: Colors.textSecondary, marginTop: 4, lineHeight: 19 },
  label: { fontSize: 14, fontWeight: '600', color: Colors.text, marginTop: 16, marginBottom: 8 },
  mealRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  mealChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  mealChipActive: { borderColor: Colors.primary, backgroundColor: Colors.primaryLight },
  mealChipText: { color: Colors.textSecondary, fontSize: 13, fontWeight: '600' },
  mealChipTextActive: { color: Colors.primaryDark },
  quantity: { marginTop: 16 },
  estimatedCard: {
    backgroundColor: Colors.primaryLight,
    borderRadius: 12,
    padding: 14,
    marginVertical: 16,
  },
  estimatedLabel: { fontSize: 12, color: Colors.textSecondary },
  estimatedValue: { fontSize: 15, fontWeight: '700', color: Colors.primaryDark, marginTop: 4 },
  cancelRow: { alignItems: 'center', marginTop: 14 },
  cancelText: { color: Colors.primary, fontWeight: '600', fontSize: 14 },
});
