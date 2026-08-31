export type FitnessGoal = 'lose_weight' | 'build_muscle' | 'gain_weight' | 'maintain';

export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'very_active';

export type DietaryPreference = 'none' | 'vegetarian' | 'eggetarian' | 'vegan' | 'non_vegetarian';

export type Gender = 'male' | 'female' | 'other';

export type TargetSource = 'calculated' | 'manual';

export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export type DrinkType = 'water' | 'other';

export type SleepQuality = 'poor' | 'fair' | 'good' | 'excellent';

export type Difficulty = 'beginner' | 'intermediate' | 'advanced';

export interface Profile {
  id: string;
  full_name: string;
  age: number;
  gender: Gender;
  height_cm: number;
  weight_kg: number;
  activity_level: ActivityLevel;
  fitness_goal: FitnessGoal;
  dietary_preference: DietaryPreference;
  exclusions: string[];
  preferred_workout_duration_minutes: number;
  sleep_goal_minutes: number;
  calorie_target: number;
  protein_target: number;
  water_target_ml: number;
  step_target: number;
  calorie_target_source: TargetSource;
  protein_target_source: TargetSource;
  water_target_source: TargetSource;
  onboarded: boolean;
  created_at: string;
  updated_at: string;
}

export interface FoodItem {
  id: string;
  name: string;
  category: string;
  serving_unit: string;
  serving_size: number;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  fiber_g: number;
  is_vegetarian: boolean;
  contains_egg: boolean;
  is_vegan: boolean;
  contains_dairy: boolean;
  contains_peanuts: boolean;
  contains_gluten: boolean;
  contains_soy: boolean;
  contains_seafood: boolean;
  description: string;
}

export interface FoodLog {
  id: string;
  user_id: string;
  food_item_id: string;
  meal_type: MealType;
  quantity: number;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  logged_at: string;
  created_at: string;
  food_items?: FoodItem;
}

export interface WaterLog {
  id: string;
  user_id: string;
  amount_ml: number;
  drink_type: DrinkType;
  logged_at: string;
  created_at: string;
}

export interface WeightLog {
  id: string;
  user_id: string;
  weight_kg: number;
  logged_at: string;
  created_at: string;
}

export interface SleepLog {
  id: string;
  user_id: string;
  bedtime: string;
  wake_time: string;
  duration_minutes: number;
  sleep_quality: SleepQuality | null;
  notes: string | null;
  created_at: string;
}

export interface Exercise {
  id: string;
  name: string;
  category: string;
  muscle_group: string;
  difficulty: Difficulty;
  equipment: string;
  instructions: string;
  duration_minutes: number;
  estimated_calories: number;
}

export interface Workout {
  id: string;
  name: string;
  description: string;
  goal: FitnessGoal;
  difficulty: Difficulty;
  duration_minutes: number;
  workout_type: string;
}

export interface WorkoutExercise {
  id: string;
  workout_id: string;
  exercise_id: string;
  order_index: number;
  sets: number;
  reps: number;
  duration_seconds: number;
  rest_seconds: number;
  exercises?: Exercise;
}

export interface WorkoutLog {
  id: string;
  user_id: string;
  workout_id: string;
  duration_minutes: number;
  calories_burned: number;
  completed_at: string;
  notes: string | null;
  workouts?: Workout;
}

export interface DailySteps {
  id: string;
  user_id: string;
  step_count: number;
  log_date: string;
  created_at: string;
}

export interface NotificationSettings {
  id: string;
  user_id: string;
  water_reminder: boolean;
  water_time: string;
  meal_reminder: boolean;
  meal_time: string;
  workout_reminder: boolean;
  workout_time: string;
  sleep_reminder: boolean;
  sleep_time: string;
  weekly_summary: boolean;
  weekly_summary_day: string;
  weekly_summary_time: string;
}

export interface NotificationInput {
  water_reminder: boolean;
  water_time: string;
  meal_reminder: boolean;
  meal_time: string;
  workout_reminder: boolean;
  workout_time: string;
  sleep_reminder: boolean;
  sleep_time: string;
  weekly_summary: boolean;
  weekly_summary_day: string;
  weekly_summary_time: string;
}

export interface AIConversation {
  id: string;
  user_id: string;
  title: string;
  created_at: string;
}

export interface AIMessage {
  id: string;
  conversation_id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

export interface NutritionTotals {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  water: number;
  steps: number;
}
