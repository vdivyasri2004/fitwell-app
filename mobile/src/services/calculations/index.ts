import {
  ActivityLevel,
  FitnessGoal,
  Gender,
} from '../../types';

export interface BodyMetricsInput {
  age: number;
  gender: Gender;
  heightCm: number;
  weightKg: number;
  activityLevel: ActivityLevel;
}

export interface TargetInput extends BodyMetricsInput {
  fitnessGoal: FitnessGoal;
}

export interface Targets {
  bmi: number;
  bmr: number;
  tdee: number;
  calorieTarget: number;
  proteinTarget: number;
  waterTargetMl: number;
}

const ACTIVITY_MULTIPLIERS: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  very_active: 1.725,
};

export function calculateBMI(weightKg: number, heightCm: number): number {
  if (!weightKg || !heightCm || weightKg <= 0 || heightCm <= 0) return 0;
  const heightM = heightCm / 100;
  return weightKg / (heightM * heightM);
}

export function calculateBMR(input: BodyMetricsInput): number {
  const { age, gender, heightCm, weightKg } = input;
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age;
  if (gender === 'male') return base + 5;
  if (gender === 'female') return base - 161;
  return base - 78;
}

export function calculateTDEE(input: BodyMetricsInput): number {
  const bmr = calculateBMR(input);
  return bmr * ACTIVITY_MULTIPLIERS[input.activityLevel];
}

export function calorieAdjustment(tdee: number, goal: FitnessGoal): number {
  switch (goal) {
    case 'lose_weight':
      return Math.round(tdee - 0.2 * tdee);
    case 'gain_weight':
      return Math.round(tdee + 0.15 * tdee);
    case 'build_muscle':
      return Math.round(tdee + 0.05 * tdee);
    case 'maintain':
    default:
      return Math.round(tdee);
  }
}

export function calculateProtein(weightKg: number, goal: FitnessGoal): number {
  switch (goal) {
    case 'lose_weight':
      return Math.round(weightKg * 1.6);
    case 'build_muscle':
      return Math.round(weightKg * 1.8);
    case 'gain_weight':
      return Math.round(weightKg * 1.8);
    case 'maintain':
    default:
      return Math.round(weightKg * 1.2);
  }
}

export function calculateWaterTarget(weightKg: number, activityLevel: ActivityLevel): number {
  const base = weightKg * 33;
  const activityBonus: Record<ActivityLevel, number> = {
    sedentary: 0,
    light: 200,
    moderate: 400,
    very_active: 600,
  };
  return Math.round(base + activityBonus[activityLevel]);
}

export function calculateTargets(input: TargetInput): Targets {
  const bmi = calculateBMI(input.weightKg, input.heightCm);
  const bmr = calculateBMR(input);
  const tdee = calculateTDEE(input);
  const calorieTarget = calorieAdjustment(tdee, input.fitnessGoal);
  const proteinTarget = calculateProtein(input.weightKg, input.fitnessGoal);
  const waterTargetMl = calculateWaterTarget(input.weightKg, input.activityLevel);
  return { bmi, bmr, tdee, calorieTarget, proteinTarget, waterTargetMl };
}
