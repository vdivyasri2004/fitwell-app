// Wrappers for the server-side admin endpoints. All requests go through the
// admin API and are authorized/audited server-side.

import { apiFetch } from './api';

export interface DashboardStats {
  users: number;
  foods: number;
  exercises: number;
  workouts: number;
  food_logs: number;
  workout_logs: number;
  admins: number;
}

export interface AdminUser {
  id: string;
  full_name: string;
  email: string | null;
  age: number | null;
  gender: string;
  fitness_goal: string;
  dietary_preference: string;
  onboarded: boolean;
  created_at: string;
  is_admin: boolean;
}

export interface Food {
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

export interface Exercise {
  id: string;
  name: string;
  category: string;
  muscle_group: string;
  difficulty: string;
  equipment: string;
  instructions: string;
  duration_minutes: number;
  estimated_calories: number;
}

export interface Workout {
  id: string;
  name: string;
  description: string;
  goal: string;
  difficulty: string;
  duration_minutes: number;
  workout_type: string;
}

export interface WorkoutExercise {
  id: string;
  exercise_id: string;
  name: string;
  muscle_group: string;
  order_index: number;
  sets: number;
  reps: number;
  duration_seconds: number;
  rest_seconds: number;
}

export async function checkIsAdmin(): Promise<boolean> {
  // Server-side check: /api/auth/me returns the user's role from the DB.
  try {
    const res = await apiFetch<{ user: { role: string } }>('/api/auth/me');
    return res.user.role === 'admin';
  } catch {
    return false;
  }
}

export async function getStats(): Promise<DashboardStats> {
  return apiFetch<DashboardStats>('/api/admin/stats');
}

export async function listUsers(): Promise<AdminUser[]> {
  return apiFetch<AdminUser[]>('/api/admin/users');
}

export async function setRole(userId: string, role: 'user' | 'admin'): Promise<void> {
  await apiFetch(`/api/admin/users/${userId}/role`, { method: 'PUT', body: { role } });
}

export async function deleteUser(userId: string): Promise<void> {
  await apiFetch(`/api/admin/users/${userId}`, { method: 'DELETE' });
}

export async function searchFoods(term = ''): Promise<Food[]> {
  const q = term ? `?term=${encodeURIComponent(term)}` : '';
  return apiFetch<Food[]>(`/api/admin/foods${q}`);
}

export async function upsertFood(payload: Partial<Food>): Promise<Food> {
  return apiFetch<Food>('/api/admin/foods', { method: 'POST', body: payload });
}

export async function deleteFood(id: string): Promise<void> {
  await apiFetch(`/api/admin/foods/${id}`, { method: 'DELETE' });
}

export async function allExercises(): Promise<Exercise[]> {
  return apiFetch<Exercise[]>('/api/admin/exercises');
}

export async function upsertExercise(payload: Partial<Exercise>): Promise<Exercise> {
  return apiFetch<Exercise>('/api/admin/exercises', { method: 'POST', body: payload });
}

export async function deleteExercise(id: string): Promise<void> {
  await apiFetch(`/api/admin/exercises/${id}`, { method: 'DELETE' });
}

export async function allWorkouts(): Promise<Workout[]> {
  return apiFetch<Workout[]>('/api/admin/workouts');
}

export async function upsertWorkout(payload: Partial<Workout>): Promise<Workout> {
  return apiFetch<Workout>('/api/admin/workouts', { method: 'POST', body: payload });
}

export async function deleteWorkout(id: string): Promise<void> {
  await apiFetch(`/api/admin/workouts/${id}`, { method: 'DELETE' });
}

export async function workoutExercises(workoutId: string): Promise<WorkoutExercise[]> {
  return apiFetch<WorkoutExercise[]>(`/api/admin/workouts/${workoutId}/exercises`);
}

export async function saveWorkoutExercises(
  workoutId: string,
  exercises: { exercise_id: string; order_index: number; sets: number; reps: number; duration_seconds: number; rest_seconds: number }[],
): Promise<void> {
  await apiFetch(`/api/admin/workouts/${workoutId}/exercises`, {
    method: 'PUT',
    body: { exercises },
  });
}
