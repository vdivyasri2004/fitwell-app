// Notification settings.
import { apiFetch } from './client';
import { NotificationSettings, NotificationInput } from '../../types';

export type { NotificationInput };

export async function getNotificationSettings(_userId: string): Promise<NotificationSettings | null> {
  return apiFetch<NotificationSettings | null>('/api/notification-settings');
}

export async function upsertNotificationSettings(
  _userId: string,
  input: Partial<NotificationInput>,
): Promise<NotificationSettings> {
  return apiFetch<NotificationSettings>('/api/notification-settings', {
    method: 'PUT',
    body: input,
  });
}
