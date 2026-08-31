import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { NotificationSettings } from '../../types';

const isNative = Platform.OS !== 'web';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

async function ensurePermission(): Promise<boolean> {
  if (!isNative) return false;
  const { status } = await Notifications.getPermissionsAsync();
  let current = status;
  if (current !== 'granted') {
    const req = await Notifications.requestPermissionsAsync();
    current = req.status;
  }
  return current === 'granted';
}

function timeToSeconds(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return (h || 0) * 3600 + (m || 0) * 60;
}

function dailyNotificationId(key: string): string {
  return `fitwell-${key}`;
}

async function scheduleDaily(key: string, time: string, title: string, body: string) {
  if (!isNative) return;
  const id = dailyNotificationId(key);
  await Notifications.cancelScheduledNotificationAsync(id).catch(() => {});
  await Notifications.scheduleNotificationAsync({
    identifier: id,
    content: { title, body, sound: true },
    trigger: { type: Notifications.SchedulableTriggerInputTypes.DAILY, hour: Math.floor(timeToSeconds(time) / 3600), minute: Math.floor((timeToSeconds(time) % 3600) / 60) },
  });
}

async function cancelDaily(key: string) {
  if (!isNative) return;
  await Notifications.cancelScheduledNotificationAsync(dailyNotificationId(key)).catch(() => {});
}

export interface NotificationApplyResult {
  configured: boolean;
  supported: boolean;
  message?: string;
}

export async function applyNotificationSettings(
  settings: NotificationSettings,
): Promise<NotificationApplyResult> {
  if (!isNative) {
    return {
      configured: false,
      supported: false,
      message:
        'Native notifications require a device or emulator. On the web, reminders are not delivered.',
    };
  }

  const granted = await ensurePermission();
  if (!granted) {
    return {
      configured: false,
      supported: true,
      message: 'Notification permission was not granted.',
    };
  }

  await Notifications.cancelAllScheduledNotificationsAsync();

  if (settings.water_reminder) {
    await scheduleDaily('water', settings.water_time, 'Stay Hydrated 💧', 'Time for a glass of water!');
  }
  if (settings.meal_reminder) {
    await scheduleDaily('meal', settings.meal_time, 'Meal Time 🍽️', 'Have you logged your meal yet?');
  }
  if (settings.workout_reminder) {
    await scheduleDaily('workout', settings.workout_time, 'Move Your Body 💪', 'Time for your workout!');
  }
  if (settings.sleep_reminder) {
    await scheduleDaily('sleep', settings.sleep_time, 'Wind Down 🌙', 'Prepare for a good night\'s sleep.');
  }

  if (settings.weekly_summary) {
    const dayTimes: Record<string, string> = {
      monday: 'Mon',
      tuesday: 'Tue',
      wednesday: 'Wed',
      thursday: 'Thu',
      friday: 'Fri',
      saturday: 'Sat',
      sunday: 'Sun',
    };
    await scheduleDaily(
      'weekly',
      settings.weekly_summary_time ?? '18:00',
      'Your Weekly Summary 📊',
      `Check your progress for this ${dayTimes[settings.weekly_summary_day] ?? 'week'}!`,
    );
  }

  return { configured: true, supported: true };
}

export async function disableAllNotifications(): Promise<void> {
  if (!isNative) return;
  await Notifications.cancelAllScheduledNotificationsAsync();
}

/** Check whether native notifications are currently supported in this environment. */
export function notificationsSupported(): boolean {
  return isNative;
}
