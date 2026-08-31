import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { showAlert } from '../../utils/alert';
import { useRouter } from 'expo-router';
import { Button, Field, OptionSelect } from '../../components/ui';
import { useAuthStore } from '../../store/authStore';
import { createProfile, updateProfile, ProfileInput } from '../../services/api/profileService';
import { calculateTargets } from '../../services/calculations';
import { Gender, ActivityLevel, FitnessGoal, TargetSource } from '../../types';
import {
  Colors,
  ACTIVITY_LEVELS,
  GLOBAL_GOALS,
  DIETARY_PREFERENCES,
  EXCLUSION_OPTIONS,
  DEFAULT_SLEEP_GOAL_MINUTES,
  STEP_GOAL_DEFAULT,
} from '../../constants';
import {
  validateName,
  validateAge,
  validateHeight,
  validateWeight,
  validatePositiveNumber,
} from '../../utils/validation';

const GOAL_OPTIONS = Object.entries(GLOBAL_GOALS).map(([value, label]) => ({ value, label }));
const ACTIVITY_OPTIONS = Object.entries(ACTIVITY_LEVELS).map(([value, label]) => ({ value, label }));
const DIET_OPTIONS = Object.entries(DIETARY_PREFERENCES).map(([value, label]) => ({ value, label }));
const GENDER_OPTIONS = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Other' },
];
const EXCLUSION_OPTIONS_MAP = EXCLUSION_OPTIONS.map((label) => ({ value: label, label }));
const EXCLUSION_KEY = {
  Peanuts: 'Peanuts',
  Dairy: 'Dairy',
  Eggs: 'Eggs',
  Gluten: 'Gluten',
  Soy: 'Soy',
  Seafood: 'Seafood',
  Other: 'Other',
};

const STEP_LABELS = ['About you', 'Your activity', 'Your goals', 'Confirm'];

export default function OnboardingForm() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const setProfile = useAuthStore((s) => s.setProfile);

  const [step, setStep] = useState(0);

  const [form, setForm] = useState({
    full_name: '',
    age: '',
    gender: '',
    height_cm: '',
    weight_kg: '',
    activity_level: '',
    fitness_goal: '',
    dietary_preference: '',
    exclusions: [] as string[],
    preferred_workout_duration_minutes: '30',
    sleep_goal_minutes: String(DEFAULT_SLEEP_GOAL_MINUTES),
  });

  const [customExclusion, setCustomExclusion] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const set = (key: string, value: string) => setForm((f) => ({ ...f, [key]: value }));

  const validateStep = (s: number): boolean => {
    const e: Record<string, string> = {};
    if (s === 0) {
      const name = validateName(form.full_name);
      if (!name.valid) e.full_name = name.message!;
      const age = validateAge(form.age);
      if (!age.valid) e.age = age.message!;
      if (!form.gender) e.gender = 'Please select your gender.';
      const height = validateHeight(form.height_cm);
      if (!height.valid) e.height_cm = height.message!;
      const weight = validateWeight(form.weight_kg);
      if (!weight.valid) e.weight_kg = weight.message!;
    }
    if (s === 1) {
      if (!form.activity_level) e.activity_level = 'Please select your activity level.';
      const duration = validatePositiveNumber(form.preferred_workout_duration_minutes, 'Workout duration');
      if (!duration.valid) e.preferred_workout_duration_minutes = duration.message!;
      const sleep = validatePositiveNumber(form.sleep_goal_minutes, 'Sleep goal');
      if (!sleep.valid) e.sleep_goal_minutes = sleep.message!;
    }
    if (s === 2) {
      if (!form.fitness_goal) e.fitness_goal = 'Please select your fitness goal.';
      if (!form.dietary_preference) e.dietary_preference = 'Please select a dietary preference.';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleNext = () => {
    if (!validateStep(step)) return;
    if (step < STEP_LABELS.length - 1) {
      setStep(step + 1);
    }
  };

  const handleSave = async () => {
    if (!validateStep(step)) return;
    if (!user) return;

    const exclusions = [...form.exclusions];
    if (customExclusion.trim()) {
      exclusions.push(customExclusion.trim());
    }

    setSaving(true);
    try {
      const targets = calculateTargets({
        age: Number(form.age),
        gender: form.gender as Gender,
        heightCm: Number(form.height_cm),
        weightKg: Number(form.weight_kg),
        activityLevel: form.activity_level as ActivityLevel,
        fitnessGoal: form.fitness_goal as FitnessGoal,
      });

      const payload: ProfileInput = {
        full_name: form.full_name.trim(),
        age: Number(form.age),
        gender: form.gender,
        height_cm: Number(form.height_cm),
        weight_kg: Number(form.weight_kg),
        activity_level: form.activity_level,
        fitness_goal: form.fitness_goal,
        dietary_preference: form.dietary_preference,
        exclusions,
        preferred_workout_duration_minutes: Number(form.preferred_workout_duration_minutes),
        sleep_goal_minutes: Number(form.sleep_goal_minutes),
        calorie_target: targets.calorieTarget,
        protein_target: targets.proteinTarget,
        water_target_ml: targets.waterTargetMl,
        step_target: STEP_GOAL_DEFAULT,
        calorie_target_source: 'calculated' as TargetSource,
        protein_target_source: 'calculated' as TargetSource,
        water_target_source: 'calculated' as TargetSource,
        onboarded: true,
      };

      let profile;
      try {
        profile = await createProfile(user.id, payload);
      } catch {
        profile = await updateProfile(user.id, payload);
      }
      setProfile(profile);
      router.replace('/(tabs)');
    } catch (e) {
      showAlert('Error', 'We could not save your profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const toggleExclusion = (value: string) => {
    setForm((f) => ({
      ...f,
      exclusions: f.exclusions.includes(value)
        ? f.exclusions.filter((v) => v !== value)
        : [...f.exclusions, value],
    }));
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Let's set up your profile</Text>
        <Text style={styles.subtitle}>
          Step {step + 1} of {STEP_LABELS.length}: {STEP_LABELS[step]}
        </Text>

        <View style={styles.progressTrack}>
          {STEP_LABELS.map((_, i) => (
            <View key={i} style={[styles.progressDot, i <= step && styles.progressDotActive]} />
          ))}
        </View>

        {step === 0 && (
          <View style={styles.section}>
            <Field label="Full name" value={form.full_name} onChangeText={(v) => set('full_name', v)} placeholder="Your full name" error={errors.full_name} containerStyle={styles.field} />
            <Field label="Age" value={form.age} onChangeText={(v) => set('age', v)} keyboardType="number-pad" placeholder="e.g. 25" error={errors.age} containerStyle={styles.field} />
            <Text style={styles.label}>Gender</Text>
            <OptionSelect options={GENDER_OPTIONS} value={form.gender} onChange={(v) => set('gender', v)} />
            {errors.gender && <Text style={styles.errorText}>{errors.gender}</Text>}
            <Field label="Height (cm)" value={form.height_cm} onChangeText={(v) => set('height_cm', v)} keyboardType="decimal-pad" placeholder="e.g. 170" error={errors.height_cm} containerStyle={styles.field} />
            <Field label="Weight (kg)" value={form.weight_kg} onChangeText={(v) => set('weight_kg', v)} keyboardType="decimal-pad" placeholder="e.g. 70" error={errors.weight_kg} containerStyle={styles.field} />
          </View>
        )}

        {step === 1 && (
          <View style={styles.section}>
            <Text style={styles.label}>Activity level</Text>
            <OptionSelect options={ACTIVITY_OPTIONS} value={form.activity_level} onChange={(v) => set('activity_level', v)} />
            {errors.activity_level && <Text style={styles.errorText}>{errors.activity_level}</Text>}
            <Field label="Preferred workout duration (minutes)" value={form.preferred_workout_duration_minutes} onChangeText={(v) => set('preferred_workout_duration_minutes', v)} keyboardType="number-pad" containerStyle={styles.field} error={errors.preferred_workout_duration_minutes} />
            <Field label="Sleep goal (minutes)" value={form.sleep_goal_minutes} onChangeText={(v) => set('sleep_goal_minutes', v)} keyboardType="number-pad" containerStyle={styles.field} error={errors.sleep_goal_minutes} />
          </View>
        )}

        {step === 2 && (
          <View style={styles.section}>
            <Text style={styles.label}>Fitness goal</Text>
            <OptionSelect options={GOAL_OPTIONS} value={form.fitness_goal} onChange={(v) => set('fitness_goal', v)} />
            {errors.fitness_goal && <Text style={styles.errorText}>{errors.fitness_goal}</Text>}
            <Text style={styles.label}>Dietary preference</Text>
            <OptionSelect options={DIET_OPTIONS} value={form.dietary_preference} onChange={(v) => set('dietary_preference', v)} />
            {errors.dietary_preference && <Text style={styles.errorText}>{errors.dietary_preference}</Text>}
            <Text style={styles.label}>Food exclusions / allergies</Text>
            <Text style={styles.hint}>Select any foods you avoid. Recommendations will respect these.</Text>
            <OptionSelect
              options={EXCLUSION_OPTIONS_MAP}
              multi
              selectedValues={form.exclusions}
              onChange={(joined) => setForm((f) => ({ ...f, exclusions: joined ? joined.split(',') : [] }))}
            />
            <Field label="Other exclusion (optional)" value={customExclusion} onChangeText={setCustomExclusion} placeholder="e.g. Mushroom" containerStyle={styles.field} />
          </View>
        )}

        {step === 3 && (
          <View style={styles.section}>
            <Text style={styles.confirmTitle}>Almost done!</Text>
            <Text style={styles.confirmText}>
              We'll calculate your estimated daily targets based on this information. These are estimates,
              not medical prescriptions — you can adjust them anytime.
            </Text>
            <View style={styles.summaryCard}>
              <SummaryRow label="Name" value={form.full_name} />
              <SummaryRow label="Age / Gender" value={`${form.age} / ${form.gender}`} />
              <SummaryRow label="Height" value={`${form.height_cm} cm`} />
              <SummaryRow label="Weight" value={`${form.weight_kg} kg`} />
              <SummaryRow label="Activity" value={ACTIVITY_LEVELS[form.activity_level] ?? ''} />
              <SummaryRow label="Goal" value={GLOBAL_GOALS[form.fitness_goal] ?? ''} />
              <SummaryRow label="Diet" value={DIETARY_PREFERENCES[form.dietary_preference] ?? ''} />
              {form.exclusions.length > 0 && <SummaryRow label="Exclusions" value={form.exclusions.join(', ')} />}
            </View>
          </View>
        )}

        <View style={styles.navRow}>
          {step > 0 && <Button title="Back" variant="outline" onPress={() => setStep(step - 1)} style={styles.navBtn} />}
          {step < STEP_LABELS.length - 1 ? (
            <Button title="Continue" onPress={handleNext} style={styles.navBtn} />
          ) : (
            <Button title="Finish" onPress={handleSave} loading={saving} style={styles.navBtn} />
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.summaryRow}>
      <Text style={styles.summaryLabel}>{label}</Text>
      <Text style={styles.summaryValue}>{value || '—'}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flexGrow: 1,
    padding: 20,
    paddingTop: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.text,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 6,
  },
  progressTrack: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 16,
    marginBottom: 8,
  },
  progressDot: {
    width: 24,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.border,
  },
  progressDotActive: {
    backgroundColor: Colors.primary,
  },
  section: {
    marginTop: 20,
  },
  field: {
    marginBottom: 16,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  hint: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  errorText: {
    color: Colors.danger,
    fontSize: 12,
    marginTop: 4,
  },
  navRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginTop: 28,
  },
  navBtn: {
    flex: 1,
  },
  confirmTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.text,
  },
  confirmText: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 21,
    marginTop: 8,
  },
  summaryCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 16,
    marginTop: 20,
    gap: 10,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summaryLabel: {
    color: Colors.textSecondary,
    fontSize: 14,
  },
  summaryValue: {
    color: Colors.text,
    fontWeight: '600',
    fontSize: 14,
    flexShrink: 1,
    textAlign: 'right',
  },
});
