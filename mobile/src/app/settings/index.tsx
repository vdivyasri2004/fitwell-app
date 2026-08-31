import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { showAlert } from '../../utils/alert';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Screen, Card, SectionTitle, Button } from '../../components/ui';
import { useAuthStore } from '../../store/authStore';
import { Colors } from '../../constants';

export default function Settings() {
  const router = useRouter();
  const logout = useAuthStore((s) => s.logout);
  const user = useAuthStore((s) => s.user);

  const handleLogout = () => {
    showAlert('Log out?', 'You will need to sign in again.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Log out', style: 'destructive', onPress: () => logout() },
    ]);
  };

  return (
    <Screen>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} accessibilityLabel="Back" style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={Colors.text} />
        </Pressable>
        <Text style={styles.title}>Settings</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Card style={styles.profileCard}>
          <View style={styles.avatar}><Text style={styles.avatarText}>{user?.email?.charAt(0).toUpperCase() ?? 'F'}</Text></View>
          <View style={{ flex: 1 }}>
            <Text style={styles.email}>{user?.email}</Text>
            <Text style={styles.accountType}>FitWell account</Text>
          </View>
        </Card>

        <SectionTitle>Account</SectionTitle>
        <Card style={styles.menuCard}>
          <MenuItem icon="person-outline" label="Edit Profile & Goals" onPress={() => router.push('/edit-profile')} />
          <MenuItem icon="notifications-outline" label="Notification Settings" onPress={() => router.push('/settings/notifications')} />
          <MenuItem icon="lock-closed-outline" label="Change Password" onPress={() => showAlert('Reset password', 'Use the "Forgot password" link on the login screen to reset your password.')} />
        </Card>

        <SectionTitle>About</SectionTitle>
        <Card style={styles.menuCard}>
          <MenuItem icon="information-circle-outline" label="About FitWell" onPress={() => router.push('/settings')} />
        </Card>

        <Button title="Log Out" variant="danger" onPress={handleLogout} style={styles.logout} />

        <Text style={styles.version}>FitWell v1.0.0</Text>
      </ScrollView>
    </Screen>
  );
}

function MenuItem({ icon, label, onPress }: { icon: React.ComponentProps<typeof Ionicons>['name']; label: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={styles.menuItem} accessibilityRole="button">
      <Ionicons name={icon} size={20} color={Colors.textSecondary} />
      <Text style={styles.menuLabel}>{label}</Text>
      <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 8, marginBottom: 16 },
  backBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: Colors.surface, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 18, fontWeight: '700', color: Colors.text },
  scroll: { paddingBottom: 30 },
  profileCard: { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 18, marginBottom: 8 },
  avatar: { width: 52, height: 52, borderRadius: 26, backgroundColor: Colors.primaryLight, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 22, fontWeight: '800', color: Colors.primaryDark },
  email: { fontSize: 15, fontWeight: '700', color: Colors.text },
  accountType: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
  menuCard: { marginBottom: 8 },
  menuItem: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: Colors.border },
  menuLabel: { flex: 1, fontSize: 15, color: Colors.text },
  logout: { marginTop: 12 },
  version: { textAlign: 'center', color: Colors.textMuted, fontSize: 12, marginTop: 20 },
});
