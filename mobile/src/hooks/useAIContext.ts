import { useMemo } from 'react';
import { useAuthStore } from '../store/authStore';
import { AIProviderContext } from '../services/ai/types';
import { Profile } from '../types';
import { TodayData } from './useTodayData';

export function buildAIContext(profile: Profile | null, today: TodayData): AIProviderContext {
  return {
    profile: {
      full_name: profile?.full_name,
      age: profile?.age,
      gender: profile?.gender,
      height_cm: profile?.height_cm,
      weight_kg: profile?.weight_kg,
      activity_level: profile?.activity_level,
      fitness_goal: profile?.fitness_goal,
      dietary_preference: profile?.dietary_preference,
      exclusions: profile?.exclusions,
      calorie_target: profile?.calorie_target,
      protein_target: profile?.protein_target,
      water_target_ml: profile?.water_target_ml,
      sleep_goal_minutes: profile?.sleep_goal_minutes,
    },
    today: {
      caloriesConsumed: today.calories,
      proteinConsumed: today.protein,
      carbsConsumed: today.carbs,
      fatConsumed: today.fat,
      waterConsumed: today.water,
      steps: today.steps,
      sleepMinutes: today.sleepMinutes,
    },
    recentMeals: today.foodLogs.slice(0, 5).map((f) => f.food_items?.name ?? ''),
  };
}

export function useAIContext(today: TodayData): AIProviderContext {
  const profile = useAuthStore((s) => s.profile);
  return useMemo(() => buildAIContext(profile, today), [profile, today]);
}
