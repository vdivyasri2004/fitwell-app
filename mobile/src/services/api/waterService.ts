// Water logs.
import { apiFetch } from './client';
import { WaterLog, DrinkType } from '../../types';

export async function addWaterLog(
  _userId: string,
  amountMl: number,
  loggedAt: string,
  drinkType: DrinkType = 'water',
): Promise<WaterLog> {
  return apiFetch<WaterLog>('/api/water-logs', {
    method: 'POST',
    body: { amount_ml: amountMl, drink_type: drinkType, logged_at: loggedAt },
  });
}

export async function getWaterLogsForDay(_userId: string, date: string): Promise<WaterLog[]> {
  const start = `${date}T00:00:00.000Z`;
  const end = `${date}T23:59:59.999Z`;
  return apiFetch<WaterLog[]>(
    `/api/water-logs?from=${encodeURIComponent(start)}&to=${encodeURIComponent(end)}`,
  );
}

export function sumWater(logs: WaterLog[]): number {
  return logs.reduce((acc, l) => acc + l.amount_ml, 0);
}

export async function deleteWaterLog(logId: string, _userId: string): Promise<void> {
  await apiFetch<void>(`/api/water-logs/${logId}`, { method: 'DELETE' });
}
