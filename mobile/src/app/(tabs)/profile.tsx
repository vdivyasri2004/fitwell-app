import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Screen, Card, SectionTitle, Button } from '../../components/ui';
import { useAuthStore } from '../../store/authStore';
import { calculateBMI } from '../../services/calculations';
import { showAlert } from '../../utils/alert';
import {
  Colors,
  GLOBAL_GOALS,
  ACTIVITY_LEVELS,
  DIETARY_PREFERENCES,
} from '../../constants';

export default function Profile() {
  const router = useRouter();
  const profile = useAuthStore((s) => s.profile);
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  if (!profile) return null;

  const bmi = calculateBMI(profile.weight_kg, profile.height_cm);
  const bmiCategory =
    bmi < 18.5 ? 'Underweight' : bmi < 25 ? 'Healthy' : bmi < 30 ? 'Overweight' : 'Obese';

  const handleLogout = () => {
    showAlert('Log out?', 'You will need to sign in again.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Log out', style: 'destructive', onPress: () => logout() },
    ]);
  };

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.headerCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{profile.full_name?.charAt(0).toUpperCase() ?? 'F'}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.name}>{profile.full_name}</Text>
            <Text style={styles.email}>{user?.email}</Text>
            <View style={styles.goalPill}>
              <Ionicons name="flag-outline" size={14} color={Colors.primaryDark} />
              <Text style={styles.goalPillText}>{GLOBAL_GOALS[profile.fitness_goal]}</Text>
            </View>
          </View>
        </View>

        <SectionTitle>Body & Targets</SectionTitle>
        <Card style={styles.infoCard}>
          <InfoRow label="Age / Gender" value={`${profile.age} · ${profile.gender}`} />
          <InfoRow label="Height" value={`${profile.height_cm} cm`} />
          <InfoRow label="Weight" value={`${profile.weight_kg} kg`} />
          <InfoRow label="Activity level" value={ACTIVITY_LEVELS[profile.activity_level]} />
          <InfoRow label="Diet" value={DIETARY_PREFERENCES[profile.dietary_preference]} />
          {profile.exclusions && profile.exclusions.length > 0 && (
            <InfoRow label="Exclusions" value={profile.exclusions.join(', ')} />
          )}
          <View style={styles.bmiRow}>
            <Text style={styles.infoLabel}>BMI</Text>
            <Text style={styles.bmiValue}>{bmi.toFixed(1)} ({bmiCategory})</Text>
          </View>
        </Card>

        <Card style={styles.targetsCard}>
          <TargetRow label="Est. calorie target" value={`${profile.calorie_target} kcal`} source={profile.calorie_target_source} />
          <TargetRow label="Est. protein target" value={`${profile.protein_target} g`} source={profile.protein_target_source} />
          <TargetRow label="Water target" value={`${profile.water_target_ml} ml`} source={profile.water_target_source} />
        </Card>

        <SectionTitle>Manage</SectionTitle>
        <Card style={styles.menuCard}>
          <MenuItem icon="create-outline" label="Edit Profile & Goals" onPress={() => router.push('/edit-profile')} />
          <MenuItem icon="notifications-outline" label="Notification Settings" onPress={() => router.push('/settings/notifications')} />
          <MenuItem icon="settings-outline" label="Settings" onPress={() => router.push('/settings')} />
          <MenuItem icon="shield-checkmark-outline" label="Privacy & Data" onPress={() => router.push('/settings')} />
        </Card>

        <View style={{ height: 12 }} />
        <Button title="Log Out" variant="danger" onPress={handleLogout} style={styles.logout} />

        <Text style={styles.disclaimer}>
          This application provides general wellness and fitness estimates and is not a medical diagnosis or treatment tool.
        </Text>
      </ScrollView>
    </Screen>
  );
}

function MenuItem({ icon, label, onPress }: { icon: React.ComponentProps<typeof Ionicons>['name']; label: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={styles.menuItem} accessibilityRole="button">
      <Ionicons name={icon} size={20} color={Colors.primary} />
      <Text style={styles.menuLabel}>{label}</Text>
      <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
    </Pressable>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

function TargetRow({ label, value, source }: { label: string; value: string; source: string }) {
  return (
    <View style={styles.targetRow}>
      <View style={{ flex: 1 }}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.targetHint}>Source: {source === 'manual' ? 'customized by you' : 'calculated estimate'}</Text>
      </View>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingBottom: 30 },
  headerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    backgroundColor: Colors.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 20,
    marginTop: 8,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontSize: 26, fontWeight: '800', color: Colors.primaryDark },
  name: { fontSize: 20, fontWeight: '800', color: Colors.text },
  email: { fontSize: 13, color: Colors.textSecondary, marginTop: 2 },
  goalPill: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 8, alignSelf: 'flex-start', backgroundColor: Colors.primaryLight, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 14 },
  goalPillText: { color: Colors.primaryDark, fontWeight: '600', fontSize: 12 },
  infoCard: { marginBottom: 12 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: Colors.border },
  infoLabel: { fontSize: 14, color: Colors.textSecondary },
  infoValue: { fontSize: 14, fontWeight: '600', color: Colors.text, flexShrink: 1, textAlign: 'right', marginLeft: 12 },
  infoRowLast: { borderBottomWidth: 0 },
  bmiRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10 },
  bmiValue: { fontSize: 14, fontWeight: '700', color: Colors.primaryDark },
  targetsCard: { marginBottom: 4 },
  targetRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: Colors.border },
  targetHint: { fontSize: 11, color: Colors.textMuted, marginTop: 2 },
  menuCard: { marginBottom: 8 },
  menuItem: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: Colors.border },
  menuLabel: { flex: 1, fontSize: 15, color: Colors.text },
  logout: { marginTop: 8 },
  disclaimer: { fontSize: 11, color: Colors.textMuted, textAlign: 'center', marginTop: 20, lineHeight: 16 },
});
