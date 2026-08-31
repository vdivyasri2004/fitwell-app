// Profile: create/read/update against the local backend.
import { apiFetch } from './client';
import { Profile, TargetSource } from '../../types';

export interface ProfileInput {
  full_name: string;
  age: number;
  gender: string;
  height_cm: number;
  weight_kg: number;
  activity_level: string;
  fitness_goal: string;
  dietary_preference: string;
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
}

export interface ProfileUpdate extends Partial<ProfileInput> {}

// The backend derives the user from the session token; `userId` is accepted for
// signature compatibility but is not used as the authorization key.
export async function getProfile(_userId: string): Promise<Profile | null> {
  return apiFetch<Profile | null>('/api/profile');
}

export async function createProfile(_userId: string, profile: ProfileInput): Promise<Profile> {
  return apiFetch<Profile>('/api/profile', { method: 'POST', body: profile });
}

export async function updateProfile(_userId: string, update: ProfileUpdate): Promise<Profile> {
  return apiFetch<Profile>('/api/profile', {
    method: 'PUT',
    body: { ...update, updated_at: new Date().toISOString() },
  });
}

export async function isProfileOnboarded(userId: string): Promise<boolean> {
  const profile = await getProfile(userId);
  return profile?.onboarded ?? false;
}
