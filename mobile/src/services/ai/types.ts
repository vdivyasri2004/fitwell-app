export interface AIProviderContext {
  profile: {
    full_name?: string;
    age?: number;
    gender?: string;
    height_cm?: number;
    weight_kg?: number;
    activity_level?: string;
    fitness_goal?: string;
    dietary_preference?: string;
    exclusions?: string[];
    calorie_target?: number;
    protein_target?: number;
    water_target_ml?: number;
    sleep_goal_minutes?: number;
  };
  today?: {
    caloriesConsumed?: number;
    proteinConsumed?: number;
    carbsConsumed?: number;
    fatConsumed?: number;
    waterConsumed?: number;
    steps?: number;
    sleepMinutes?: number;
  };
  recentMeals?: string[];
  recentWorkouts?: string[];
  weightTrend?: number[];
  weeklyStats?: Record<string, number>;
}

export interface AIProvider {
  readonly name: string;
  available: boolean;
  generateRecommendation(context: AIProviderContext, prompt: string): Promise<string>;
  chat(messages: { role: 'user' | 'assistant'; content: string }[], context: AIProviderContext): Promise<string>;
  generateWeeklyInsight(context: AIProviderContext): Promise<string>;
}
