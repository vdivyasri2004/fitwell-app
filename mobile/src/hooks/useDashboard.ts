import { useCallback, useEffect, useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { useTodayData } from './useTodayData';
import { useAIContext } from './useAIContext';
import { recommendFoods } from '../services/recommendations/foodRecommendations';
import { getAllFoods, getRecommendedWorkouts } from '../services/api';
import { aiService } from '../services/ai';
import { FoodSuggestion } from '../types/recommendations';
import { Workout } from '../types';
import { STEP_GOAL_DEFAULT } from '../constants';

export interface DashboardData {
  today: ReturnType<typeof useTodayData>;
  aiInsight: string;
  aiProvider: string;
  mealSuggestion: FoodSuggestion | null;
  workout: Workout | null;
  stepGoal: number;
  loading: boolean;
  refresh: () => Promise<void>;
}

export function useDashboard(): DashboardData {
  const profile = useAuthStore((s) => s.profile);
  const today = useTodayData();
  const aiContext = useAIContext(today);
  const [mealSuggestion, setMealSuggestion] = useState<FoodSuggestion | null>(null);
  const [workout, setWorkout] = useState<Workout | null>(null);
  const [aiInsight, setAiInsight] = useState('');
  const [aiProvider, setAiProvider] = useState('');

  const refresh = useCallback(async () => {
    await today.refresh();
    if (!profile) return;

    const caloriesRemaining = profile.calorie_target - today.calories;
    const proteinRemaining = profile.protein_target - today.protein;

    try {
      const foods = await getAllFoods(100);
      const suggestions = recommendFoods(foods, {
        goal: profile.fitness_goal,
        dietaryPreference: profile.dietary_preference,
        exclusions: profile.exclusions ?? [],
        caloriesRemaining,
        proteinRemaining,
      });
      setMealSuggestion(suggestions[0] ?? null);
    } catch {
      setMealSuggestion(null);
    }

    try {
      const workouts = await getRecommendedWorkouts(
        profile.fitness_goal,
        'beginner',
        6,
      );
      setWorkout(workouts[0] ?? null);
    } catch {
      setWorkout(null);
    }

    try {
      const { text, provider } = await aiService.generateRecommendation(
        aiContext,
        'daily insight',
      );
      setAiInsight(text);
      setAiProvider(provider);
    } catch {
      setAiInsight('');
    }
  }, [profile, today, aiContext]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return {
    today,
    aiInsight,
    aiProvider,
    mealSuggestion,
    workout,
    stepGoal: STEP_GOAL_DEFAULT,
    loading: today.loading,
    refresh,
  };
}
