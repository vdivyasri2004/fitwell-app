// Food logs against the local backend. Responses include the joined `food_items`.
import { apiFetch } from './client';
import { FoodLog, MealType } from '../../types';

export interface FoodLogInput {
  food_item_id: string;
  meal_type: MealType;
  quantity: number;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  logged_at: string;
}

export async function addFoodLog(_userId: string, input: FoodLogInput): Promise<FoodLog> {
  return apiFetch<FoodLog>('/api/food-logs', { method: 'POST', body: input });
}

export async function getFoodLogsForDay(_userId: string, date: string): Promise<FoodLog[]> {
  const start = `${date}T00:00:00.000Z`;
  const end = `${date}T23:59:59.999Z`;
  return apiFetch<FoodLog[]>(
    `/api/food-logs?from=${encodeURIComponent(start)}&to=${encodeURIComponent(end)}`,
  );
}

export function aggregateFoodLogs(logs: FoodLog[]) {
  return logs.reduce(
    (acc, log) => ({
      calories: acc.calories + (log.calories || 0),
      protein: acc.protein + (log.protein_g || 0),
      carbs: acc.carbs + (log.carbs_g || 0),
      fat: acc.fat + (log.fat_g || 0),
      count: acc.count + 1,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0, count: 0 },
  );
}

export async function updateFoodLog(
  logId: string,
  _userId: string,
  input: Partial<FoodLogInput>,
): Promise<FoodLog> {
  return apiFetch<FoodLog>(`/api/food-logs/${logId}`, { method: 'PUT', body: input });
}

export async function deleteFoodLog(logId: string, _userId: string): Promise<void> {
  await apiFetch<void>(`/api/food-logs/${logId}`, { method: 'DELETE' });
}

export async function getFoodLogsRange(
  _userId: string,
  startDate: string,
  endDate: string,
): Promise<FoodLog[]> {
  const start = `${startDate}T00:00:00.000Z`;
  const end = `${endDate}T23:59:59.999Z`;
  return apiFetch<FoodLog[]>(
    `/api/food-logs?from=${encodeURIComponent(start)}&to=${encodeURIComponent(end)}`,
  );
}

export async function getRecentFoodLogs(_userId: string, limit = 30): Promise<FoodLog[]> {
  return apiFetch<FoodLog[]>(`/api/food-logs?limit=${limit}`);
}
