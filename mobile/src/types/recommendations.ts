import { FoodItem, Workout } from '../types';

export interface DietFlags {
  hold_vegetarian: boolean;
  hold_egg: boolean;
  hold_vegan: boolean;
  hold_dairy: boolean;
  hold_peanuts: boolean;
  hold_gluten: boolean;
  hold_soy: boolean;
  hold_seafood: boolean;
}

export interface FoodRecommendationContext {
  goal: string;
  dietaryPreference: string;
  exclusions: string[];
  caloriesRemaining: number;
  proteinRemaining: number;
  mealType?: string;
}

export interface FoodSuggestion {
  food: FoodItem;
  calories: number;
  protein: number;
  mealType: string;
}

export interface WorkoutRecommendationContext {
  goal: string;
  difficulty: string;
  preferredDurationMinutes: number;
  recentWorkouts: unknown[];
}

export interface WeeklyInsight {
  text: string;
}

export type AIProviderName = 'rule' | 'external';
