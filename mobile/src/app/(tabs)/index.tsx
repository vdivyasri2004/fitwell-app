import { View, Text, StyleSheet, ScrollView, Pressable, RefreshControl } from 'react-native';
import { useRouter, Link } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuthStore } from '../../store/authStore';
import { useDashboard } from '../../hooks/useDashboard';
import { Screen, Card, SectionTitle, ProgressBar, ActivityRings } from '../../components/ui';
import { useCountUp } from '../../hooks/useCountUp';
import { Colors, GLOBAL_GOALS, STEP_GOAL_DEFAULT } from '../../constants';
import { shortGreeting } from '../../utils/helpers';

export default function Home() {
  const router = useRouter();
  const profile = useAuthStore((s) => s.profile);
  const { today, aiInsight, mealSuggestion, workout, loading, refresh } = useDashboard();

  const stepGoal = profile?.step_target ?? STEP_GOAL_DEFAULT;

  return (
    <Screen padding={false} style={styles.screen}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={refresh} />}
        showsVerticalScrollIndicator={false}
      >
        <LinearGradient
          colors={[Colors.gym.bgSoft, Colors.gym.bgCard]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.hero}
        >
          <View style={styles.heroGlare} />
          <LinearGradient
            colors={[Colors.gym.limeGlow, 'transparent']}
            start={{ x: 1, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={styles.heroAccent}
          />
          <View style={styles.heroTop}>
            <View>
              <Text style={styles.heroGreeting}>{shortGreeting()},</Text>
              <Text style={styles.heroName}>{profile?.full_name?.split(' ')[0] ?? 'there'}</Text>
              <Text style={styles.heroDate}>
                {new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
              </Text>
            </View>
            <View style={styles.heroIconWrap}>
              <MaterialCommunityIcons name="dumbbell" size={34} color={Colors.gym.lime} />
            </View>
          </View>
          {profile?.fitness_goal && (
            <View style={styles.goalBadge}>
              <Ionicons name="flag" size={14} color={Colors.gym.lime} />
              <Text style={styles.goalBadgeText}>{GLOBAL_GOALS[profile.fitness_goal]}</Text>
            </View>
          )}

          <View style={styles.ringsRow}>
            <ActivityRings
              size={172}
              strokeWidth={15}
              rings={[
                { value: today.calories, target: profile?.calorie_target ?? 1, color: Colors.gym.calories },
                { value: today.protein, target: profile?.protein_target ?? 1, color: Colors.gym.protein },
                { value: today.water, target: profile?.water_target_ml ?? 1, color: Colors.gym.water },
              ]}
              center={
                <View style={styles.ringsCenter}>
                  <Text style={styles.ringsValue}>{useCountUp(Number(today.calories) || 0).toLocaleString()}</Text>
                  <Text style={styles.ringsLabel}>kcal used</Text>
                </View>
              }
            />
            <View style={styles.ringsLegend}>
              <LegendDot color={Colors.gym.calories} label="Calories" value={`${Math.round(today.calories)} / ${profile?.calorie_target ?? 0}`} />
              <LegendDot color={Colors.gym.protein} label="Protein" value={`${Math.round(today.protein)} / ${profile?.protein_target ?? 0} g`} />
              <LegendDot color={Colors.gym.water} label="Water" value={`${Math.round(today.water / 100) / 10} / ${profile?.water_target_ml ? Math.round(profile.water_target_ml / 1000 * 10) / 10 : 0} L`} />
            </View>
          </View>
        </LinearGradient>

        <SectionTitle style={{ color: Colors.gym.ink, marginTop: 14 }}>Today's progress</SectionTitle>

        <MetricCard
          icon="flame-outline"
          color={Colors.gym.calories}
          label="Calories"
          value={today.calories}
          target={profile?.calorie_target ?? 0}
          unit="kcal"
        />
        <View style={styles.row}>
          <MetricCard
            icon="pulse-outline"
            color={Colors.gym.protein}
            label="Protein"
            value={today.protein}
            target={profile?.protein_target ?? 0}
            unit="g"
            compact
          />
          <MetricCard
            icon="water-outline"
            color={Colors.gym.water}
            label="Water"
            value={today.water}
            target={profile?.water_target_ml ?? 0}
            unit="ml"
            compact
          />
        </View>

        <MetricCard
          icon="footsteps-outline"
          color={Colors.gym.steps}
          label="Steps"
          value={today.steps}
          target={stepGoal}
          unit="steps"
          mono
        />

        <SectionTitle style={styles.sectionTitle}>Quick Actions</SectionTitle>
        <View style={styles.quickActions}>
          <QuickAction label="Log Food" icon="restaurant-outline" onPress={() => router.push('/food/search')} />
          <QuickAction label="Add Water" icon="water-outline" onPress={() => router.push('/water')} />
          <QuickAction label="Log Weight" icon="scale-outline" onPress={() => router.push('/weight')} />
          <QuickAction label="Log Sleep" icon="bed-outline" onPress={() => router.push('/sleep')} />
          <QuickAction label="Workout" icon="barbell-outline" onPress={() => router.push('/(tabs)/workout')} />
        </View>

        <SectionTitle style={styles.sectionTitle}>Recommendations</SectionTitle>
        {mealSuggestion ? (
          <RecommendationCard
            icon="restaurant-outline"
            title="Try this meal"
            subtitle={`${mealSuggestion.food.name} · ${Math.round(mealSuggestion.calories)} kcal · ${Math.round(mealSuggestion.protein)}g protein`}
            onPress={() => router.push('/food/search')}
          />
        ) : (
          <EmptyHint text="Log some meals to unlock meal suggestions." />
        )}
        {workout ? (
          <RecommendationCard
            icon="barbell-outline"
            title="Today's workout"
            subtitle={`${workout.name} · ${workout.duration_minutes} min`}
            onPress={() => router.push(`/workout-details?id=${workout.id}`)}
          />
        ) : (
          <EmptyHint text="Pick a workout to get going." />
        )}

        {aiInsight ? (
          <Card style={styles.aiCard}>
            <View style={styles.aiHeader}>
              <View style={styles.aiIconWrap}>
                <Ionicons name="sparkles-outline" size={18} color={Colors.primaryDark} />
              </View>
              <Text style={styles.aiTitle}>Your insight</Text>
            </View>
            <Text style={styles.aiBody} numberOfLines={6}>{aiInsight}</Text>
            <Link href="/assistant" asChild>
              <Pressable style={styles.aiCta}>
                <Text style={styles.aiCtaText}>Ask your assistant</Text>
                <Ionicons name="arrow-forward" size={16} color={Colors.primary} />
              </Pressable>
            </Link>
          </Card>
        ) : (
          <Link href="/assistant" asChild>
            <Pressable style={styles.assistantButton}>
              <Ionicons name="sparkles" size={20} color={Colors.primaryDark} />
              <Text style={styles.assistantButtonText}>Ask AI Assistant</Text>
            </Pressable>
          </Link>
        )}
      </ScrollView>
    </Screen>
  );
}

interface MetricCardProps {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  color: string;
  label: string;
  value: number;
  target: number;
  unit: string;
  compact?: boolean;
  mono?: boolean;
}

function MetricCard({ icon, color, label, value, target, unit, compact, mono }: MetricCardProps) {
  const progress = target > 0 ? Math.min(1, Number(value) / target) : 0;
  const animated = useCountUp(Number(value) || 0);
  return (
    <LinearGradient
      colors={[Colors.gym.bgCardHi, Colors.gym.bgCard]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[
        styles.metricCard,
        compact && styles.metricCardCompact,
        { borderColor: 'transparent' },
      ]}
    >
      <LinearGradient
        colors={[color, 'transparent']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.metricGlow, { opacity: 0.22 }]}
      />
      <View style={styles.metricTop}>
        <View style={[styles.metricIcon, { backgroundColor: `${color}26` }]}>
          <Ionicons name={icon} size={20} color={color} />
        </View>
        <Text style={[styles.metricLabel, { color: Colors.gym.inkMuted }]}>{label}</Text>
      </View>
      <View style={styles.metricBottom}>
        <Text style={[styles.metricValue, { color: Colors.gym.ink }]}>
          {mono ? animated.toLocaleString() : Math.round(animated)}
        </Text>
        <Text style={[styles.metricTarget, { color }]}>{unit}</Text>
      </View>
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${progress * 100}%`, backgroundColor: color }]} />
      </View>
      <Text style={styles.metricHint}>
        {Number(value).toLocaleString()} / {Number(target).toLocaleString()}
      </Text>
    </LinearGradient>
  );
}

interface QuickActionProps {
  label: string;
  icon: React.ComponentProps<typeof Ionicons>['name'];
  onPress: () => void;
}

function QuickAction({ label, icon, onPress }: QuickActionProps) {
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={label} style={styles.quickAction}>
      <View style={styles.quickIcon}>
        <Ionicons name={icon} size={22} color={Colors.gym.lime} />
      </View>
      <Text style={styles.quickLabel}>{label}</Text>
    </Pressable>
  );
}

interface RecCardProps {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  title: string;
  subtitle: string;
  onPress: () => void;
}

function RecommendationCard({ icon, title, subtitle, onPress }: RecCardProps) {
  return (
    <Pressable onPress={onPress}>
      <Card style={styles.recCard}>
        <View style={styles.recIconWrap}>
          <Ionicons name={icon} size={22} color={Colors.gym.lime} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.recTitle}>{title}</Text>
          <Text style={styles.recSubtitle}>{subtitle}</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={Colors.gym.inkDim} />
      </Card>
    </Pressable>
  );
}

function EmptyHint({ text }: { text: string }) {
  return (
    <View style={styles.emptyHint}>
      <Text style={styles.emptyHintText}>{text}</Text>
    </View>
  );
}

interface LegendDotProps {
  color: string;
  label: string;
  value: string;
}

function LegendDot({ color, label, value }: LegendDotProps) {
  return (
    <View style={styles.legendRow}>
      <View style={[styles.legendDot, { backgroundColor: color }]} />
      <Text style={styles.legendLabel}>{label}</Text>
      <Text style={[styles.legendValue, { color }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { backgroundColor: Colors.gym.bg },
  scroll: { paddingBottom: 40 },
  hero: {
    backgroundColor: Colors.gym.bg,
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 22,
    overflow: 'hidden',
    borderBottomWidth: 1,
    borderBottomColor: Colors.gym.line,
  },
  heroGlare: {
    position: 'absolute',
    top: -70,
    right: -40,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: Colors.gym.limeGlow,
  },
  heroAccent: {
    position: 'absolute',
    bottom: -60,
    left: -40,
    width: 220,
    height: 140,
  },
  heroTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  heroGreeting: { fontSize: 15, color: Colors.gym.lime },
  heroName: { fontSize: 30, fontWeight: '900', color: Colors.gym.ink, marginTop: 2, letterSpacing: 0.3 },
  heroDate: { fontSize: 13, color: Colors.gym.inkMuted, marginTop: 6 },
  heroIconWrap: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: Colors.gym.bgCard,
    borderWidth: 1,
    borderColor: Colors.gym.line,
    alignItems: 'center',
    justifyContent: 'center',
  },
  goalBadge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.gym.limeGlow,
    borderWidth: 1,
    borderColor: Colors.gym.line,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  goalBadgeText: { color: Colors.gym.lime, fontWeight: '700', fontSize: 12 },
  ringsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  ringsCenter: { alignItems: 'center' },
  ringsValue: { fontSize: 30, fontWeight: '900', color: Colors.gym.ink, letterSpacing: 0.5 },
  ringsLabel: { fontSize: 12, color: Colors.gym.inkMuted, marginTop: 2 },
  ringsLegend: { flex: 1, marginLeft: 16, gap: 12 },
  legendRow: { flexDirection: 'row', alignItems: 'center' },
  legendDot: { width: 10, height: 10, borderRadius: 5, marginRight: 8 },
  legendLabel: { fontSize: 13, color: Colors.gym.inkMuted, flex: 1 },
  legendValue: { fontSize: 13, fontWeight: '700' },
  sectionTitle: { color: Colors.gym.ink },
  row: { flexDirection: 'row', gap: 12, marginTop: 12 },
  metricCard: {
    marginTop: 12,
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: Colors.gym.line,
    overflow: 'hidden',
  },
  metricCardCompact: { flex: 1 },
  metricGlow: { position: 'absolute', top: 0, right: 0, width: 140, height: 140 },
  metricTop: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  metricIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  metricLabel: { fontSize: 14, fontWeight: '600' },
  metricBottom: { flexDirection: 'row', alignItems: 'baseline', marginTop: 12, gap: 6 },
  metricValue: { fontSize: 32, fontWeight: '900', letterSpacing: 0.3 },
  metricTarget: { fontSize: 14, fontWeight: '700' },
  progressTrack: {
    marginTop: 12,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.08)',
    overflow: 'hidden',
  },
  progressFill: { height: '100%', borderRadius: 3 },
  metricHint: { fontSize: 12, color: Colors.gym.inkDim, marginTop: 6 },
  quickActions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  quickAction: { width: '18%', alignItems: 'center', gap: 6, minWidth: 62, flexGrow: 1 },
  quickIcon: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: Colors.gym.bgCard,
    borderWidth: 1,
    borderColor: Colors.gym.line,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickLabel: { fontSize: 11, color: Colors.gym.inkMuted, textAlign: 'center' },
  recCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 10,
    backgroundColor: Colors.gym.bgCard,
    borderColor: Colors.gym.line,
  },
  recIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: Colors.gym.limeGlow,
    alignItems: 'center',
    justifyContent: 'center',
  },
  recTitle: { fontSize: 15, fontWeight: '700', color: Colors.gym.ink },
  recSubtitle: { fontSize: 12, color: Colors.gym.inkMuted, marginTop: 2 },
  emptyHint: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.gym.line,
    backgroundColor: Colors.gym.bgCard,
    marginBottom: 10,
  },
  emptyHintText: { color: Colors.gym.inkMuted, fontSize: 13, textAlign: 'center' },
  aiCard: { marginTop: 4, backgroundColor: Colors.gym.bgCard, borderColor: Colors.gym.line },
  aiHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  aiIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: Colors.gym.steps + '26',
    alignItems: 'center',
    justifyContent: 'center',
  },
  aiTitle: { fontSize: 15, fontWeight: '700', color: Colors.gym.ink },
  aiBody: { fontSize: 13, color: Colors.gym.inkMuted, lineHeight: 20, marginTop: 10 },
  aiCta: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 12 },
  aiCtaText: { color: Colors.gym.lime, fontWeight: '600', fontSize: 14 },
  assistantButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.gym.limeGlow,
    borderWidth: 1,
    borderColor: Colors.gym.line,
    borderRadius: 14,
    paddingVertical: 14,
    marginTop: 16,
  },
  assistantButtonText: { color: Colors.gym.lime, fontWeight: '700', fontSize: 15 },
});
