// Daily steps.
import { apiFetch } from './client';
import { DailySteps } from '../../types';

export async function getStepsForDate(_userId: string, date: string): Promise<DailySteps | null> {
  return apiFetch<DailySteps | null>(`/api/steps?date=${encodeURIComponent(date)}`);
}

export async function upsertSteps(_userId: string, date: string, stepCount: number): Promise<DailySteps> {
  return apiFetch<DailySteps>('/api/steps', {
    method: 'PUT',
    body: { log_date: date, step_count: stepCount },
  });
}

export async function getStepsRange(
  _userId: string,
  startDate: string,
  endDate: string,
): Promise<DailySteps[]> {
  return apiFetch<DailySteps[]>(
    `/api/steps?from=${encodeURIComponent(startDate)}&to=${encodeURIComponent(endDate)}`,
  );
}
