import { View, Text, StyleSheet, ScrollView, Pressable, ActivityIndicator } from 'react-native';
import { showAlert } from '../utils/alert';
import { useRouter } from 'expo-router';
import { useState, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Screen, Button, Field, OptionSelect } from '../components/ui';
import { useAuthStore } from '../store/authStore';
import { updateProfile } from '../services/api/profileService';
import { calculateTargets } from '../services/calculations';
import { TargetSource, Gender, ActivityLevel, FitnessGoal } from '../types';
import { Colors, GLOBAL_GOALS, ACTIVITY_LEVELS, DIETARY_PREFERENCES, DEFAULT_SLEEP_GOAL_MINUTES, STEP_GOAL_DEFAULT } from '../constants';
import { validateName, validateAge, validateHeight, validateWeight, validatePositiveNumber } from '../utils/validation';

const GOAL_OPTIONS = Object.entries(GLOBAL_GOALS).map(([value, label]) => ({ value, label }));
const ACTIVITY_OPTIONS = Object.entries(ACTIVITY_LEVELS).map(([value, label]) => ({ value, label }));
const DIET_OPTIONS = Object.entries(DIETARY_PREFERENCES).map(([value, label]) => ({ value, label }));
const GENDER_OPTIONS = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Other' },
];

export default function EditProfile() {
  const router = useRouter();
  const profile = useAuthStore((s) => s.profile);
  const setProfile = useAuthStore((s) => s.setProfile);

  const [fullName, setFullName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [activity, setActivity] = useState('');
  const [goal, setGoal] = useState('');
  const [diet, setDiet] = useState('');
  const [exclusions, setExclusions] = useState('');
  const [workoutDuration, setWorkoutDuration] = useState('');
  const [sleepGoal, setSleepGoal] = useState('');

  const [calorieTarget, setCalorieTarget] = useState('');
  const [proteinTarget, setProteinTarget] = useState('');
  const [waterTarget, setWaterTarget] = useState('');
  const [stepTarget, setStepTarget] = useState('');
  const [calorieSource, setCalorieSource] = useState<TargetSource>('calculated');
  const [proteinSource, setProteinSource] = useState<TargetSource>('calculated');
  const [waterSource, setWaterSource] = useState<TargetSource>('calculated');

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name);
      setAge(String(profile.age));
      setGender(profile.gender);
      setHeight(String(profile.height_cm));
      setWeight(String(profile.weight_kg));
      setActivity(profile.activity_level);
      setGoal(profile.fitness_goal);
      setDiet(profile.dietary_preference);
      setExclusions((profile.exclusions ?? []).join(', '));
      setWorkoutDuration(String(profile.preferred_workout_duration_minutes ?? 30));
      setSleepGoal(String(profile.sleep_goal_minutes ?? DEFAULT_SLEEP_GOAL_MINUTES));
      setCalorieTarget(String(profile.calorie_target));
      setProteinTarget(String(profile.protein_target));
      setWaterTarget(String(profile.water_target_ml));
      setStepTarget(String(profile.step_target ?? STEP_GOAL_DEFAULT));
      setCalorieSource(profile.calorie_target_source);
      setProteinSource(profile.protein_target_source);
      setWaterSource(profile.water_target_source);
    }
  }, [profile]);

  if (!profile) {
    return (
      <Screen>
        <ActivityIndicator size="large" color={Colors.primary} style={{ marginTop: 60 }} />
      </Screen>
    );
  }

  const numAge = () => Number(age);
  const numHeight = () => Number(height);
  const numWeight = () => Number(weight);
  const computed = () =>
    calculateTargets({
      age: numAge(),
      gender: gender as Gender,
      heightCm: numHeight(),
      weightKg: numWeight(),
      activityLevel: activity as ActivityLevel,
      fitnessGoal: goal as FitnessGoal,
    });

  /** Recompute calculated targets for fields that are still calculated. */
  const refreshCalculated = () => {
    if (!numAge() || !numHeight() || !numWeight() || !activity || !goal) return;
    const t = computed();
    if (calorieSource === 'calculated') setCalorieTarget(String(t.calorieTarget));
    if (proteinSource === 'calculated') setProteinTarget(String(t.proteinTarget));
    if (waterSource === 'calculated') setWaterTarget(String(t.waterTargetMl));
  };

  const handleSave = async () => {
    const e: Record<string, string> = {};
    const name = validateName(fullName); if (!name.valid) e.fullName = name.message!;
    const a = validateAge(age); if (!a.valid) e.age = a.message!;
    const h = validateHeight(height); if (!h.valid) e.height = h.message!;
    const w = validateWeight(weight); if (!w.valid) e.weight = w.message!;
    if (!gender) e.gender = 'Select gender.';
    const c = validatePositiveNumber(calorieTarget, 'Calorie target'); if (!c.valid) e.calorie = c.message!;
    const p = validatePositiveNumber(proteinTarget, 'Protein target'); if (!p.valid) e.protein = p.message!;
    const wt = validatePositiveNumber(waterTarget, 'Water target'); if (!wt.valid) e.water = wt.message!;
    setErrors(e);
    if (Object.keys(e).length) return;

    setSaving(true);
    try {
      const parsedExclusions = exclusions.split(',').map((s) => s.trim()).filter(Boolean);
      const updated = await updateProfile(profile.id, {
        full_name: fullName.trim(),
        age: numAge(),
        gender,
        height_cm: numHeight(),
        weight_kg: numWeight(),
        activity_level: activity,
        fitness_goal: goal,
        dietary_preference: diet,
        exclusions: parsedExclusions,
        preferred_workout_duration_minutes: Number(workoutDuration || 30),
        sleep_goal_minutes: Number(sleepGoal || DEFAULT_SLEEP_GOAL_MINUTES),
        calorie_target: Number(calorieTarget),
        protein_target: Number(proteinTarget),
        water_target_ml: Number(waterTarget),
        step_target: Number(stepTarget || STEP_GOAL_DEFAULT),
        calorie_target_source: calorieSource,
        protein_target_source: proteinSource,
        water_target_source: waterSource,
      });
      setProfile(updated);
      showAlert('Saved', 'Your profile has been updated.');
      router.back();
    } catch {
      showAlert('Error', 'Could not save your profile.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Screen>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} accessibilityLabel="Back" style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={Colors.text} />
        </Pressable>
        <Text style={styles.title}>Edit Profile</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Field label="Full name" value={fullName} onChangeText={setFullName} placeholder="Full name" error={errors.fullName} containerStyle={styles.field} />
        <View style={styles.row}>
          <Field label="Age" value={age} onChangeText={setAge} keyboardType="number-pad" error={errors.age} containerStyle={styles.duo} />
          <Field label="Height (cm)" value={height} onChangeText={setHeight} keyboardType="numeric" error={errors.height} containerStyle={styles.duo} />
        </View>
        <Field label="Weight (kg)" value={weight} onChangeText={setWeight} keyboardType="numeric" error={errors.weight} containerStyle={styles.field} />

        <Text style={styles.label}>Gender</Text>
        <OptionSelect options={GENDER_OPTIONS} value={gender} onChange={setGender} />
        {errors.gender && <Text style={styles.errorText}>{errors.gender}</Text>}

        <Text style={styles.label}>Activity level</Text>
        <OptionSelect options={ACTIVITY_OPTIONS} value={activity} onChange={(v) => { setActivity(v); setTimeout(refreshCalculated, 0); }} />

        <Text style={styles.label}>Fitness goal</Text>
        <OptionSelect options={GOAL_OPTIONS} value={goal} onChange={(v) => { setGoal(v); setTimeout(refreshCalculated, 0); }} />

        <Text style={styles.label}>Dietary preference</Text>
        <OptionSelect options={DIET_OPTIONS} value={diet} onChange={setDiet} />

        <Field label="Food exclusions (comma separated)" value={exclusions} onChangeText={setExclusions} placeholder="e.g. Peanuts, Dairy" containerStyle={styles.field} />
        <View style={styles.row}>
          <Field label="Workout duration (min)" value={workoutDuration} onChangeText={setWorkoutDuration} keyboardType="number-pad" containerStyle={styles.duo} />
          <Field label="Sleep goal (min)" value={sleepGoal} onChangeText={setSleepGoal} keyboardType="number-pad" containerStyle={styles.duo} />
        </View>

        <Text style={styles.sectionSub}>Daily targets (estimates)</Text>
        <TargetField
          label="Calorie target (kcal)"
          value={calorieTarget}
          onChange={(v) => { setCalorieTarget(v); setCalorieSource('manual'); }}
          source={calorieSource}
          error={errors.calorie}
          onReset={() => { const t = computed(); setCalorieTarget(String(t.calorieTarget)); setCalorieSource('calculated'); }}
        />
        <TargetField
          label="Protein target (g)"
          value={proteinTarget}
          onChange={(v) => { setProteinTarget(v); setProteinSource('manual'); }}
          source={proteinSource}
          error={errors.protein}
          onReset={() => { const t = computed(); setProteinTarget(String(t.proteinTarget)); setProteinSource('calculated'); }}
        />
        <TargetField
          label="Water target (ml)"
          value={waterTarget}
          onChange={(v) => { setWaterTarget(v); setWaterSource('manual'); }}
          source={waterSource}
          error={errors.water}
          onReset={() => { const t = computed(); setWaterTarget(String(t.waterTargetMl)); setWaterSource('calculated'); }}
        />
        <Field label="Step goal" value={stepTarget} onChangeText={setStepTarget} keyboardType="number-pad" containerStyle={styles.field} />

        <Button title="Save Changes" onPress={handleSave} loading={saving} style={styles.saveBtn} />

        <Text style={styles.note}>
          Estimated daily targets are not medical prescriptions. When you change your goal or body details, calculated targets update unless you customize them.
        </Text>
      </ScrollView>
    </Screen>
  );
}

interface TargetFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  source: TargetSource;
  error?: string;
  onReset: () => void;
}

function TargetField({ label, value, onChange, source, error, onReset }: TargetFieldProps) {
  return (
    <View style={styles.targetWrap}>
      <View style={styles.targetHeader}>
        <Text style={styles.targetLabel}>{label}</Text>
        {source === 'manual' && (
          <Pressable onPress={onReset} style={styles.resetBtn}>
            <Ionicons name="refresh" size={14} color={Colors.primary} />
            <Text style={styles.resetText}>Reset to calculated</Text>
          </Pressable>
        )}
      </View>
      <Field value={value} onChangeText={onChange} keyboardType="number-pad" error={error} containerStyle={{ marginBottom: 14 }} />
    </View>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 8, marginBottom: 8 },
  backBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: Colors.surface, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 18, fontWeight: '700', color: Colors.text },
  scroll: { paddingBottom: 30 },
  field: { marginBottom: 14 },
  row: { flexDirection: 'row', gap: 12 },
  duo: { flex: 1 },
  label: { fontSize: 15, fontWeight: '600', color: Colors.text, marginTop: 16, marginBottom: 8 },
  errorText: { color: Colors.danger, fontSize: 12, marginTop: 4 },
  sectionSub: { fontSize: 15, fontWeight: '700', color: Colors.text, marginTop: 20, marginBottom: 12 },
  targetWrap: { marginBottom: 4 },
  targetHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 },
  targetLabel: { fontSize: 14, fontWeight: '600', color: Colors.text },
  resetBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  resetText: { fontSize: 12, color: Colors.primary, fontWeight: '600' },
  saveBtn: { marginTop: 16 },
  note: { fontSize: 12, color: Colors.textMuted, lineHeight: 18, marginTop: 16, textAlign: 'center' },
});
