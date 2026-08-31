// Weight logs.
import { apiFetch } from './client';
import { WeightLog } from '../../types';

export async function addWeightLog(_userId: string, weightKg: number, loggedAt: string): Promise<WeightLog> {
  return apiFetch<WeightLog>('/api/weight-logs', {
    method: 'POST',
    body: { weight_kg: weightKg, logged_at: loggedAt },
  });
}

export async function getWeightLogs(_userId: string, limit = 100): Promise<WeightLog[]> {
  return apiFetch<WeightLog[]>(`/api/weight-logs?limit=${limit}`);
}

export async function getWeightLogsRange(
  _userId: string,
  startDate: string,
  endDate: string,
): Promise<WeightLog[]> {
  return apiFetch<WeightLog[]>(
    `/api/weight-logs?from=${encodeURIComponent(`${startDate}T00:00:00.000Z`)}&to=${encodeURIComponent(
      `${endDate}T23:59:59.999Z`,
    )}`,
  );
}

export async function updateWeightLog(logId: string, _userId: string, weightKg: number): Promise<WeightLog> {
  return apiFetch<WeightLog>(`/api/weight-logs/${logId}`, {
    method: 'PUT',
    body: { weight_kg: weightKg },
  });
}

export async function deleteWeightLog(logId: string, _userId: string): Promise<void> {
  await apiFetch<void>(`/api/weight-logs/${logId}`, { method: 'DELETE' });
}

export async function getMostRecentWeight(_userId: string): Promise<WeightLog | null> {
  return apiFetch<WeightLog | null>('/api/weight-logs/recent');
}
