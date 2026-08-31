import { FoodItem, DietaryPreference } from '../../types';
import { FoodRecommendationContext, FoodSuggestion } from '../../types/recommendations';
import { isFoodAllowed } from './dietFilter';

const MEAL_CATEGORIES = {
  breakfast: ['Breakfast', 'Dairy', 'Fruits', 'Grains', 'Protein'],
  lunch: ['Main Course', 'Grains', 'Dal & Legumes', 'Protein', 'Vegetables'],
  dinner: ['Main Course', 'Grains', 'Dal & Legumes', 'Protein', 'Vegetables'],
  snack: ['Snacks', 'Fruits', 'Nuts & Seeds', 'Dairy'],
};

function scoreFood(food: FoodItem, ctx: FoodRecommendationContext): number {
  let score = 0;
  // Prefer foods that roughly fit within remaining calories
  if (food.calories <= ctx.caloriesRemaining) {
    score += 2;
  }
  // Prefer high-protein foods when protein is still needed
  if (ctx.proteinRemaining > 0 && food.protein_g > 0) {
    score += Math.min(2, food.protein_g / 20);
  }
  // Small preference for lean foods when losing weight
  if (ctx.goal === 'lose_weight') {
    if (food.fat_g / Math.max(food.calories, 1) < 0.04) score += 1;
  }
  return score;
}

export function recommendFoods(
  foods: FoodItem[],
  ctx: FoodRecommendationContext,
  limit = 4,
): FoodSuggestion[] {
  const allowed = foods.filter((f) => isFoodAllowed(f, ctx.dietaryPreference as DietaryPreference, ctx.exclusions));
  const mealType = ctx.mealType ?? 'general';
  const preferredCategories = MEAL_CATEGORIES[mealType as keyof typeof MEAL_CATEGORIES] ?? [];

  const sorted = allowed
    .filter((f) => f.calories <= Math.max(ctx.caloriesRemaining, f.calories * 0.25) * 1.5)
    .sort((a, b) => {
      const aScore = scoreFood(a, ctx);
      const bScore = scoreFood(b, ctx);
      const aCat = preferredCategories.includes(a.category) ? 1 : 0;
      const bCat = preferredCategories.includes(b.category) ? 1 : 0;
      return bScore + bCat - aScore - aCat;
    });

  return sorted.slice(0, limit).map((food) => ({
    food,
    calories: food.calories,
    protein: food.protein_g,
    mealType: mealType,
  }));
}
