import { useCallback, useEffect, useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { getFoodLogsRange } from '../services/api/foodLogService';
import { getWeightLogsRange } from '../services/api/weightService';
import { getSleepLogs } from '../services/api/sleepService';
import { getWorkoutLogsRange } from '../services/api/workoutService';
import { getWaterLogsForDay } from '../services/api/waterService';
import { getStepsRange } from '../services/api/stepsService';
import { daysAgoISO, todayISO } from '../utils/helpers';
import { ChartPoint } from '../components/ui';

export interface ProgressData {
  weight: ChartPoint[];
  calories: ChartPoint[];
  protein: ChartPoint[];
  water: ChartPoint[];
  sleep: ChartPoint[];
  workoutCount: number;
  weightChange: number | null;
  avgCalories: number;
  avgProtein: number;
  avgWater: number;
  avgSleep: number;
  daysLogged: number;
  loading: boolean;
  refresh: (days: number) => Promise<void>;
}

export function useProgressData(): Omit<ProgressData, 'refresh'> & { refresh: (days: number) => Promise<void> } {
  const user = useAuthStore((s) => s.user);
  const [data, setData] = useState<ProgressData>({
    weight: [],
    calories: [],
    protein: [],
    water: [],
    sleep: [],
    workoutCount: 0,
    weightChange: null,
    avgCalories: 0,
    avgProtein: 0,
    avgWater: 0,
    avgSleep: 0,
    daysLogged: 0,
    loading: true,
    refresh: async () => {},
  });

  const refresh = useCallback(async (days: number) => {
    if (!user) {
      setData((d) => ({ ...d, loading: false }));
      return;
    }
    const start = daysAgoISO(days - 1);
    const end = todayISO();
    setData((d) => ({ ...d, loading: true }));

    try {
      const foods = await getFoodLogsRange(user.id, start, end);
      const weights = await getWeightLogsRange(user.id, start, end);
      const sleeps = await getSleepLogs(user.id, 90);
      const workouts = await getWorkoutLogsRange(user.id, start, end);
      const steps = await getStepsRange(user.id, start, end);
      const waters = await Promise.all(
        Array.from({ length: days }, (_, i) => {
          const d = new Date();
          d.setDate(d.getDate() - (days - 1 - i));
          const iso = d.toISOString().slice(0, 10);
          return getWaterLogsForDay(user.id, iso);
        }),
      );

      const byDay = new Map<string, { cal: number; pro: number; water: number }>();
      foods.forEach((f) => {
        const day = f.logged_at.slice(0, 10);
        const cur = byDay.get(day) ?? { cal: 0, pro: 0, water: 0 };
        cur.cal += f.calories || 0;
        cur.pro += f.protein_g || 0;
        byDay.set(day, cur);
      });
      waters.forEach((list) => {
        if (list.length === 0) return;
        const day = list[0].logged_at.slice(0, 10);
        const cur = byDay.get(day) ?? { cal: 0, pro: 0, water: 0 };
        cur.water += list.reduce((a, w) => a + w.amount_ml, 0);
        byDay.set(day, cur);
      });

      const sorted = Array.from(byDay.entries()).sort((a, b) => a[0].localeCompare(b[0]));
      const calories = sorted.map(([d, v]) => ({ label: d.slice(5), value: Math.round(v.cal) }));
      const protein = sorted.map(([d, v]) => ({ label: d.slice(5), value: Math.round(v.pro) }));
      const water = sorted.map(([d, v]) => ({ label: d.slice(5), value: Math.round(v.water) }));

      const weightPoints = weights
        .slice()
        .sort((a, b) => a.logged_at.localeCompare(b.logged_at))
        .map((w) => ({ label: w.logged_at.slice(5, 10), value: w.weight_kg }));

      const sleepPoints = sleeps
        .filter((s) => s.duration_minutes > 0)
        .slice()
        .sort((a, b) => a.bedtime.localeCompare(b.bedtime))
        .map((s) => ({ label: new Date(s.created_at).toISOString().slice(5, 10), value: Math.round(s.duration_minutes / 60 * 10) / 10 }));

      const avgCalories = calories.length ? calories.reduce((a, c) => a + c.value, 0) / calories.length : 0;
      const avgProtein = protein.length ? protein.reduce((a, c) => a + c.value, 0) / protein.length : 0;
      const avgWater = water.length ? water.reduce((a, c) => a + c.value, 0) / water.length : 0;
      const avgSleep = sleepPoints.length ? sleepPoints.reduce((a, c) => a + c.value, 0) / sleepPoints.length : 0;

      const weightChange =
        weightPoints.length >= 2
          ? weightPoints[weightPoints.length - 1].value - weightPoints[0].value
          : null;

      setData({
        weight: weightPoints,
        calories,
        protein,
        water,
        sleep: sleepPoints,
        workoutCount: workouts.length,
        weightChange,
        avgCalories: Math.round(avgCalories),
        avgProtein: Math.round(avgProtein),
        avgWater: Math.round(avgWater),
        avgSleep: Math.round(avgSleep * 60),
        daysLogged: sorted.length,
        loading: false,
        refresh,
      });
    } catch {
      setData((d) => ({ ...d, loading: false }));
    }
  }, [user]);

  useEffect(() => {
    refresh(30);
  }, [refresh]);

  return data;
}
