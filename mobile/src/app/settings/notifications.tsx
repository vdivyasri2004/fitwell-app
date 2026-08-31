import { View, Text, StyleSheet, ScrollView, Pressable, Switch, ActivityIndicator, TextInput } from 'react-native';
import { showAlert } from '../../utils/alert';
import { useRouter } from 'expo-router';
import { useState, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Screen, Card, SectionTitle, Button } from '../../components/ui';
import { useAuthStore } from '../../store/authStore';
import { getNotificationSettings, upsertNotificationSettings } from '../../services/api/notificationService';
import { applyNotificationSettings, notificationsSupported } from '../../services/notifications';
import { NotificationSettings } from '../../types';
import { Colors } from '../../constants';

const DEFAULTS: Partial<NotificationSettings> = {
  water_reminder: true,
  water_time: '10:00',
  meal_reminder: true,
  meal_time: '13:00',
  workout_reminder: false,
  workout_time: '18:00',
  sleep_reminder: true,
  sleep_time: '22:00',
  weekly_summary: true,
  weekly_summary_day: 'Sunday',
  weekly_summary_time: '18:00',
};

export default function NotificationSettingsScreen() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const [settings, setSettings] = useState<NotificationSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      if (!user) return;
      try {
        const data = await getNotificationSettings(user.id);
        setSettings({ ...(DEFAULTS as NotificationSettings), ...(data ?? {}) });
      } catch {
        setSettings({ ...(DEFAULTS as NotificationSettings) });
      } finally {
        setLoading(false);
      }
    })();
  }, [user]);

  useEffect(() => {
    if (!notificationsSupported()) {
      setNotice('Native reminders require a device or emulator. On the web, reminders are not delivered.');
    }
  }, []);

  if (loading || !settings || !user) {
    return (
      <Screen>
        <ActivityIndicator size="large" color={Colors.primary} style={{ marginTop: 60 }} />
      </Screen>
    );
  }

  const update = (key: keyof NotificationSettings, value: any) => {
    setSettings((s) => (s ? { ...s, [key]: value } : s));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await upsertNotificationSettings(user.id, {
        water_reminder: settings.water_reminder,
        water_time: settings.water_time,
        meal_reminder: settings.meal_reminder,
        meal_time: settings.meal_time,
        workout_reminder: settings.workout_reminder,
        workout_time: settings.workout_time,
        sleep_reminder: settings.sleep_reminder,
        sleep_time: settings.sleep_time,
        weekly_summary: settings.weekly_summary,
        weekly_summary_day: settings.weekly_summary_day,
        weekly_summary_time: settings.weekly_summary_time,
      });
      if (notificationsSupported()) {
        const result = await applyNotificationSettings(settings);
        setNotice(result.message ?? null);
      }
      showAlert('Saved', 'Notification settings updated.');
    } catch {
      showAlert('Error', 'Could not save notification settings.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Screen>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} accessibilityLabel="Back" style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={Colors.text} />
        </Pressable>
        <Text style={styles.title}>Notifications</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {notice && (
          <View style={styles.noticeBox}>
            <Text style={styles.noticeText}>{notice}</Text>
          </View>
        )}

        <ToggleRow
          icon="water-outline"
          label="Water reminder"
          value={settings.water_reminder}
          onValueChange={(v) => update('water_reminder', v)}
        />
        {settings.water_reminder && <TimeField label="Water reminder time" value={settings.water_time} onChange={(v) => update('water_time', v)} />}

        <ToggleRow
          icon="restaurant-outline"
          label="Meal logging reminder"
          value={settings.meal_reminder}
          onValueChange={(v) => update('meal_reminder', v)}
        />
        {settings.meal_reminder && <TimeField label="Meal reminder time" value={settings.meal_time} onChange={(v) => update('meal_time', v)} />}

        <ToggleRow
          icon="barbell-outline"
          label="Workout reminder"
          value={settings.workout_reminder}
          onValueChange={(v) => update('workout_reminder', v)}
        />
        {settings.workout_reminder && <TimeField label="Workout reminder time" value={settings.workout_time} onChange={(v) => update('workout_time', v)} />}

        <ToggleRow
          icon="bed-outline"
          label="Sleep reminder"
          value={settings.sleep_reminder}
          onValueChange={(v) => update('sleep_reminder', v)}
        />
        {settings.sleep_reminder && <TimeField label="Sleep reminder time" value={settings.sleep_time} onChange={(v) => update('sleep_time', v)} />}

        <ToggleRow
          icon="calendar-outline"
          label="Weekly progress summary"
          value={settings.weekly_summary}
          onValueChange={(v) => update('weekly_summary', v)}
        />
        {settings.weekly_summary && (
          <>
            <TimeField label="Weekly summary time" value={settings.weekly_summary_time} onChange={(v) => update('weekly_summary_time', v)} />
            <DaySelect value={settings.weekly_summary_day} onChange={(v) => update('weekly_summary_day', v)} />
          </>
        )}

        <Text style={styles.tip}>
          Reminders are gentle nudges and will never be aggressive. You can disable any reminder at any time.
        </Text>

        <Button title="Save Settings" onPress={handleSave} loading={saving} />
      </ScrollView>
    </Screen>
  );
}

interface ToggleRowProps {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  label: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
}

function ToggleRow({ icon, label, value, onValueChange }: ToggleRowProps) {
  return (
    <Card style={styles.toggleCard}>
      <View style={styles.toggleIcon}><Ionicons name={icon} size={20} color={Colors.primary} /></View>
      <Text style={styles.toggleLabel}>{label}</Text>
      <Switch value={value} onValueChange={onValueChange} trackColor={{ true: Colors.primary }} thumbColor="#fff" />
    </Card>
  );
}

interface TimeFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
}

function TimeField({ label, value, onChange }: TimeFieldProps) {
  return (
    <View style={styles.timeWrap}>
      <Text style={styles.timeLabel}>{label}</Text>
      <View style={styles.timeInputWrap}>
        <Ionicons name="time-outline" size={16} color={Colors.textMuted} />
        <TextInput
          value={value}
          onChangeText={onChange}
          placeholder="HH:MM"
          placeholderTextColor={Colors.textMuted}
          keyboardType="numbers-and-punctuation"
          style={styles.compactInput}
          accessibilityLabel={label}
        />
      </View>
    </View>
  );
}

interface DaySelectProps {
  value: string;
  onChange: (value: string) => void;
}

function DaySelect({ value, onChange }: DaySelectProps) {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  return (
    <View style={styles.dayRow}>
      {days.map((d) => (
        <Pressable
          key={d}
          onPress={() => onChange(d)}
          style={[styles.dayBtn, value === d && styles.dayBtnActive]}
        >
          <Text style={[styles.dayText, value === d && styles.dayTextActive]}>{d.slice(0, 3)}</Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 8, marginBottom: 16 },
  backBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: Colors.surface, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 18, fontWeight: '700', color: Colors.text },
  scroll: { paddingBottom: 30 },
  noticeBox: { backgroundColor: '#FEF3C7', borderRadius: 12, padding: 14, marginBottom: 16 },
  noticeText: { color: '#92400E', fontSize: 13, lineHeight: 19 },
  toggleCard: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 8 },
  toggleIcon: { width: 40, height: 40, borderRadius: 10, backgroundColor: Colors.primaryLight, alignItems: 'center', justifyContent: 'center' },
  toggleLabel: { flex: 1, fontSize: 15, fontWeight: '600', color: Colors.text },
  timeWrap: { paddingHorizontal: 4, marginBottom: 14 },
  timeLabel: { fontSize: 13, color: Colors.textSecondary, marginBottom: 6 },
  timeInputWrap: { flexDirection: 'row', alignItems: 'center', borderWidth: 1.5, borderColor: Colors.border, borderRadius: 12, backgroundColor: Colors.surface, paddingHorizontal: 12, gap: 8 },
  compactInput: { flex: 1, paddingVertical: 11, fontSize: 15, color: Colors.text },
  compactText: { fontSize: 13, color: Colors.textMuted },
  dayRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 14, paddingHorizontal: 4 },
  dayBtn: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 14, borderWidth: 1.5, borderColor: Colors.border, backgroundColor: Colors.surface },
  dayBtnActive: { backgroundColor: Colors.primaryLight, borderColor: Colors.primary },
  dayText: { fontSize: 12, color: Colors.textSecondary, fontWeight: '600' },
  dayTextActive: { color: Colors.primaryDark },
  tip: { fontSize: 12, color: Colors.textMuted, lineHeight: 18, marginVertical: 16, textAlign: 'center' },
});
