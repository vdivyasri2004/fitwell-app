// Workouts, exercises, and workout logs against the local backend.
import { apiFetch } from './client';
import {
  Exercise,
  Workout,
  WorkoutExercise,
  WorkoutLog,
  Difficulty,
} from '../../types';

export async function getAllExercises(_limit = 300): Promise<Exercise[]> {
  return apiFetch<Exercise[]>('/api/exercises?limit=300');
}

export async function getAllWorkouts(_limit = 100): Promise<Workout[]> {
  return apiFetch<Workout[]>('/api/workouts?limit=100');
}

export async function getRecommendedWorkouts(
  goal: string,
  _difficulty: Difficulty = 'beginner',
  _limit = 10,
): Promise<Workout[]> {
  return apiFetch<Workout[]>(`/api/workouts?goal=${encodeURIComponent(goal)}&limit=10`);
}

export async function getWorkoutById(workoutId: string): Promise<Workout | null> {
  return apiFetch<Workout | null>(`/api/workouts/${workoutId}`);
}

export async function getWorkoutExercises(workoutId: string): Promise<WorkoutExercise[]> {
  return apiFetch<WorkoutExercise[]>(`/api/workouts/${workoutId}/exercises`);
}

export async function addWorkoutLog(
  _userId: string,
  workoutId: string,
  durationMinutes: number,
  caloriesBurned: number,
  notes?: string,
): Promise<WorkoutLog> {
  return apiFetch<WorkoutLog>('/api/workout-logs', {
    method: 'POST',
    body: {
      workout_id: workoutId,
      duration_minutes: durationMinutes,
      calories_burned: caloriesBurned,
      notes: notes ?? null,
      completed_at: new Date().toISOString(),
    },
  });
}

export async function getWorkoutLogs(_userId: string, _limit = 100): Promise<WorkoutLog[]> {
  return apiFetch<WorkoutLog[]>('/api/workout-logs?limit=100');
}

export async function getWorkoutLogsRange(
  _userId: string,
  startDate: string,
  endDate: string,
): Promise<WorkoutLog[]> {
  return apiFetch<WorkoutLog[]>(
    `/api/workout-logs?from=${encodeURIComponent(`${startDate}T00:00:00.000Z`)}&to=${encodeURIComponent(
      `${endDate}T23:59:59.999Z`,
    )}`,
  );
}
