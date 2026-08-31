export const Colors = {
  // Base tokens now default to the dark theme. Every shared component
  // (Screen, Card, SectionTitle, Field, etc.) inherits these automatically.
  primary: '#C7FF3A',       // electric lime -> primary accent
  primaryDark: '#9BE11B',
  primaryLight: 'rgba(199,255,58,0.14)',
  background: '#0B0B0F',    // near-black base
  surface: '#131318',       // raised panels / inputs
  text: '#F5F6FA',          // primary text on dark
  textSecondary: '#9AA0B4',
  textMuted: '#6B7186',
  border: 'rgba(154,160,180,0.16)',
  danger: '#FF5C5C',
  warning: '#FFB02E',
  success: '#3DDC97',
  info: '#38BDF8',
  card: '#1A1B22',          // cards
  chart1: '#FF8A3D',        // calories/orange
  chart2: '#22D3EE',        // protein/cyan
  chart3: '#38BDF8',        // water/blue
  chart4: '#34D399',        // steps/green
  gold: '#FFC24B',

  // 2026 dark-mode-first fitness palette (Strava/Nike-style)
  gym: {
    bg: '#0B0B0F',      // near-black base (reduces eye strain)
    bgSoft: '#131318',   // raised panels
    bgCard: '#1A1B22',   // cards
    bgCardHi: '#212330', // hovered/active card
    ink: '#F5F6FA',      // primary text
    inkMuted: '#9AA0B4', // secondary text
    inkDim: '#6B7186',   // tertiary text
    line: 'rgba(154,160,180,0.14)', // hairline borders

    // single high-energy accent for CTAs + progress
    lime: '#C7FF3A',      // electric lime CTAs
    limeDeep: '#9BE11B',
    limeGlow: 'rgba(199,255,58,0.16)',
    onLime: '#0B0B0F',    // text on lime

    // color-coded metric accents (each stat its own energetic color)
    calories: '#FF8A3D',  // orange -> energy
    protein: '#22D3EE',   // cyan -> digital energy
    water: '#38BDF8',     // electric blue
    steps: '#34D399',     // green -> growth
    weight: '#A78BFA',    // violet
    sleep: '#818CF8',     // indigo
    workout: '#F472B6',   // pink/magenta
  },
};

export const DISCLAIMER =
  'This application provides general wellness and fitness estimates and is not a medical diagnosis or treatment tool. Nutrition and calorie requirements vary between individuals. Consult a qualified healthcare professional or registered dietitian for personalized medical or dietary advice.';

export const STEP_GOAL_DEFAULT = 8000;

export const DEFAULT_SLEEP_GOAL_MINUTES = 480;
export const DEFAULT_WATER_TARGET_ML = 2000;
export const DEFAULT_WORKOUT_DURATION_MINUTES = 30;

export const MEAL_TYPES: { value: string; label: string }[] = [
  { value: 'breakfast', label: 'Breakfast' },
  { value: 'lunch', label: 'Lunch' },
  { value: 'dinner', label: 'Dinner' },
  { value: 'snack', label: 'Snack' },
];

export const GLOBAL_GOALS: Record<string, string> = {
  lose_weight: 'Lose Weight',
  build_muscle: 'Build Muscle',
  gain_weight: 'Gain Weight',
  maintain: 'Maintain Weight',
};

export const ACTIVITY_LEVELS: Record<string, string> = {
  sedentary: 'Sedentary',
  light: 'Lightly Active',
  moderate: 'Moderately Active',
  very_active: 'Very Active',
};

export const DIETARY_PREFERENCES: Record<string, string> = {
  none: 'No Preference',
  vegetarian: 'Vegetarian',
  eggetarian: 'Vegetarian + Eggs',
  vegan: 'Vegan',
  non_vegetarian: 'Non-Vegetarian',
};

export const EXCLUSION_OPTIONS = [
  'Peanuts',
  'Dairy',
  'Eggs',
  'Gluten',
  'Soy',
  'Seafood',
  'Other',
];
