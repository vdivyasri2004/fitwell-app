import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { FoodLog } from '../types';
import {
  getFoodLogsForDay,
  aggregateFoodLogs,
} from '../services/api/foodLogService';
import { getWaterLogsForDay, sumWater } from '../services/api/waterService';
import { getStepsForDate } from '../services/api/stepsService';
import { getSleepLogs } from '../services/api/sleepService';
import { todayISO } from '../utils/helpers';

export interface TodayData {
  foodLogs: FoodLog[];
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  water: number;
  steps: number;
  sleepMinutes: number;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function useTodayData(): TodayData {
  const user = useAuthStore((s) => s.user);
  const [foodLogs, setFoodLogs] = useState<FoodLog[]>([]);
  const [water, setWater] = useState(0);
  const [steps, setSteps] = useState(0);
  const [sleepMinutes, setSleepMinutes] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const date = todayISO();
      const [logs, waters, stepsRow, sleeps] = await Promise.all([
        getFoodLogsForDay(user.id, date),
        getWaterLogsForDay(user.id, date),
        getStepsForDate(user.id, date),
        getSleepLogs(user.id, 1),
      ]);
      const totals = aggregateFoodLogs(logs);
      setFoodLogs(logs);
      setWater(sumWater(waters));
      setSteps(stepsRow?.step_count ?? 0);
      setSleepMinutes(sleeps[0]?.duration_minutes ?? 0);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load today\'s data.');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return useMemo(
    () => ({
      foodLogs,
      calories: foodLogs.reduce((a, f) => a + (f.calories || 0), 0),
      protein: foodLogs.reduce((a, f) => a + (f.protein_g || 0), 0),
      carbs: foodLogs.reduce((a, f) => a + (f.carbs_g || 0), 0),
      fat: foodLogs.reduce((a, f) => a + (f.fat_g || 0), 0),
      water,
      steps,
      sleepMinutes,
      loading,
      error,
      refresh,
    }),
    [foodLogs, water, steps, sleepMinutes, loading, error, refresh],
  );
}
