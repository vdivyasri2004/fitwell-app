// Food reference data (read-only for app users).
import { apiFetch } from './client';
import { FoodItem } from '../../types';

export interface FoodItemInput {
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

export async function searchFoods(query: string, limit = 40): Promise<FoodItem[]> {
  const params = new URLSearchParams();
  if (query && query.trim()) params.set('q', query.trim());
  params.set('limit', String(limit));
  return apiFetch<FoodItem[]>(`/api/foods?${params.toString()}`);
}

export async function getFoodsByCategory(category: string, limit = 100): Promise<FoodItem[]> {
  const params = new URLSearchParams({ category, limit: String(limit) });
  return apiFetch<FoodItem[]>(`/api/foods?${params.toString()}`);
}

export async function getAllFoods(limit = 300): Promise<FoodItem[]> {
  return apiFetch<FoodItem[]>(`/api/foods?limit=${limit}`);
}

export async function getFoodCategories(): Promise<string[]> {
  return apiFetch<string[]>('/api/foods/categories');
}
