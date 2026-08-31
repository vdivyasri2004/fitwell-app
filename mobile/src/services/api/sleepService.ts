// Sleep logs.
import { apiFetch } from './client';
import { SleepLog, SleepQuality } from '../../types';

export interface SleepLogInput {
  bedtime: string;
  wake_time: string;
  duration_minutes: number;
  sleep_quality?: SleepQuality | null;
  notes?: string | null;
}

export async function addSleepLog(_userId: string, input: SleepLogInput): Promise<SleepLog> {
  return apiFetch<SleepLog>('/api/sleep-logs', { method: 'POST', body: input });
}

export async function getSleepLogs(_userId: string, limit = 60): Promise<SleepLog[]> {
  return apiFetch<SleepLog[]>(`/api/sleep-logs?limit=${limit}`);
}

export async function updateSleepLog(
  logId: string,
  _userId: string,
  input: Partial<SleepLogInput>,
): Promise<SleepLog> {
  return apiFetch<SleepLog>(`/api/sleep-logs/${logId}`, { method: 'PUT', body: input });
}

export async function deleteSleepLog(logId: string, _userId: string): Promise<void> {
  await apiFetch<void>(`/api/sleep-logs/${logId}`, { method: 'DELETE' });
}

export function averageSleepDuration(logs: SleepLog[]): number {
  if (logs.length === 0) return 0;
  const sum = logs.reduce((acc, l) => acc + l.duration_minutes, 0);
  return Math.round(sum / logs.length);
}
