import { View, Text, StyleSheet, ScrollView, Pressable, ActivityIndicator } from 'react-native';
import { useState, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Screen, Card, LineChart, BarChart } from '../../components/ui';
import { useProgressData } from '../../hooks/useProgressData';
import { useCountUp } from '../../hooks/useCountUp';
import { useAuthStore } from '../../store/authStore';
import { aiService, AIProviderContext } from '../../services/ai';
import { Colors } from '../../constants';
import { formatMinutes } from '../../utils/helpers';

const RANGES = [
  { label: '7D', days: 7 },
  { label: '30D', days: 30 },
  { label: '90D', days: 90 },
];

export default function Progress() {
  const [range, setRange] = useState(30);
  const data = useProgressData();
  const profile = useAuthStore((s) => s.profile);
  const [insight, setInsight] = useState<string>('');

  const changeRange = (days: number) => {
    setRange(days);
    data.refresh(days);
  };

  useEffect(() => {
    let active = true;
    const build = async () => {
      const ctx: AIProviderContext = {
        profile: profile ?? {},
        weeklyStats: {
          avgCalories: data.avgCalories,
          avgSleepMinutes: data.avgSleep,
          workoutCount: data.workoutCount,
          daysLogged: data.daysLogged,
        },
      };
      if (data.weightChange !== null) ctx.weeklyStats!.weightDelta = data.weightChange;
      const res = await aiService.generateWeeklyInsight(ctx);
      if (active) setInsight(res.text);
    };
    if (!data.loading && profile) build();
    return () => { active = false; };
  }, [data.loading, data.avgCalories, data.avgSleep, data.workoutCount, data.daysLogged, data.weightChange, profile]);

  return (
    <Screen>
      <View style={styles.header}>
        <View>
          <Text style={styles.pageTitle}>Progress</Text>
          <Text style={styles.subtitle}>Your activity over time</Text>
        </View>
      </View>

      <View style={styles.rangeRow}>
        {RANGES.map((r) => (
          <Pressable
            key={r.days}
            onPress={() => changeRange(r.days)}
            style={[styles.rangeBtn, range === r.days && styles.rangeBtnActive]}
          >
            <Text style={[styles.rangeText, range === r.days && styles.rangeTextActive]}>{r.label}</Text>
          </Pressable>
        ))}
      </View>

      {data.loading ? (
        <ActivityIndicator size="large" color={Colors.primary} style={{ marginTop: 60 }} />
      ) : (
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <StatsRow
            avgCalories={data.avgCalories}
            avgProtein={data.avgProtein}
            avgWater={data.avgWater}
            avgSleep={data.avgSleep}
            workoutCount={data.workoutCount}
            weightChange={data.weightChange}
          />

          <ConsistencyCard activeLabels={data.calories.map((c) => c.label)} days={range} />

          {insight ? (
            <Card style={styles.insightCard}>
              <View style={styles.insightHeader}>
                <Ionicons name="sparkles-outline" size={18} color={Colors.primaryDark} />
                <Text style={styles.insightTitle}>Weekly insight</Text>
              </View>
              <Text style={styles.insightText}>{insight}</Text>
            </Card>
          ) : null}

          <Text style={styles.sectionLabel}>Weight</Text>
          <Card>
            {data.weight.length >= 2 ? (
              <LineChart data={data.weight} color={Colors.chart2} />
            ) : (
              <ChartEmpty message="Log your weight for at least two days to see a trend." />
            )}
            {data.weightChange !== null && (
              <Text style={[styles.delta, data.weightChange <= 0 ? styles.deltaDown : styles.deltaUp]}>
                {data.weightChange > 0 ? '+' : ''}{data.weightChange.toFixed(1)} kg over {range === 90 ? '3 months' : range === 30 ? '30 days' : '7 days'}
              </Text>
            )}
          </Card>

          <Text style={styles.sectionLabel}>Calories</Text>
          <Card>
            {data.calories.length > 0 ? (
              <BarChart data={data.calories} color={Colors.chart1} />
            ) : (
              <ChartEmpty message="Log your meals to see calorie trends." />
            )}
          </Card>

          <Text style={styles.sectionLabel}>Protein</Text>
          <Card>
            {data.protein.length > 0 ? (
              <BarChart data={data.protein} color={Colors.chart2} />
            ) : (
              <ChartEmpty message="Log your protein to see consistency." />
            )}
          </Card>

          <Text style={styles.sectionLabel}>Water</Text>
          <Card>
            {data.water.length > 0 ? (
              <BarChart data={data.water} color={Colors.chart3} />
            ) : (
              <ChartEmpty message="Log your water to see hydration trends." />
            )}
          </Card>

          <Text style={styles.sectionLabel}>Sleep</Text>
          <Card>
            {data.sleep.length > 0 ? (
              <LineChart data={data.sleep} color={Colors.chart4} />
            ) : (
              <ChartEmpty message="Log your sleep to see recovery trends." />
            )}
          </Card>
        </ScrollView>
      )}
    </Screen>
  );
}

function StatsRow({ avgCalories, avgProtein, avgWater, avgSleep, workoutCount, weightChange }: {
  avgCalories: number;
  avgProtein: number;
  avgWater: number;
  avgSleep: number;
  workoutCount: number;
  weightChange: number | null;
}) {
  return (
    <View style={styles.statsGrid}>
      <Stat label="Avg calories" value={avgCalories ? `${avgCalories}` : '—'} sub="kcal" />
      <Stat label="Avg protein" value={avgProtein ? `${avgProtein}` : '—'} sub="g" />
      <Stat label="Avg water" value={avgWater ? `${Math.round(avgWater / 100) * 100}` : '—'} sub="ml" />
      <Stat label="Avg sleep" value={avgSleep ? formatMinutes(avgSleep) : '—'} sub="" />
      <Stat label="Workouts" value={`${workoutCount}`} sub="completed" />
      <Stat label="Weight change" value={weightChange !== null ? `${weightChange > 0 ? '+' : ''}${weightChange.toFixed(1)}` : '—'} sub="kg" />
    </View>
  );
}

function Stat({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <Card style={styles.statCard}>
      <Text style={styles.statValue}>
        {value} {sub !== '' ? <Text style={styles.statSub}>{sub}</Text> : null}
      </Text>
      <Text style={styles.statLabel}>{label}</Text>
    </Card>
  );
}

function ConsistencyCard({ activeLabels, days }: { activeLabels: string[]; days: number }) {
  const active = new Set(activeLabels);
  const n = Math.min(14, days);
  const cells: { date: string; label: string; on: boolean }[] = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const date = d.toISOString().slice(0, 10);
    const label = d.getDate().toString();
    cells.push({ date, label, on: active.has(date.slice(5)) || active.has(date) });
  }

  let streak = 0;
  for (let i = cells.length - 1; i >= 0; i--) {
    if (cells[i].on) streak++;
    else break;
  }

  const activeDays = cells.filter((c) => c.on).length;
  const pct = cells.length ? Math.round((activeDays / cells.length) * 100) : 0;
  const animatedStreak = useCountUp(streak);

  return (
    <LinearGradient
      colors={[Colors.gym.bgCardHi, Colors.gym.bgCard]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.consistencyCard}
    >
      <View style={styles.consistencyHeader}>
        <View style={styles.consistencyTitleRow}>
          <View style={[styles.consistencyIcon, { backgroundColor: `${Colors.gym.lime}26` }]}>
            <Ionicons name="flame" size={18} color={Colors.gym.calories} />
          </View>
          <View>
            <Text style={styles.consistencyTitle}>Consistency</Text>
            <Text style={styles.consistencySub}>{activeDays} of {cells.length} days active · {pct}%</Text>
          </View>
        </View>
        <View style={styles.streakChip}>
          <Text style={styles.streakValue}>{animatedStreak}</Text>
          <Text style={styles.streakLabel}>day streak</Text>
        </View>
      </View>

      <View style={styles.cellsRow}>
        {cells.map((c) => (
          <View key={c.date} style={styles.cellWrap}>
            <View
              style={[
                styles.cell,
                c.on
                  ? { backgroundColor: Colors.gym.lime, shadowColor: Colors.gym.lime, shadowOpacity: 0.5, shadowRadius: 4 }
                  : { backgroundColor: Colors.gym.bgCardHi },
              ]}
            />
            <Text style={styles.cellLabel}>{c.label}</Text>
          </View>
        ))}
      </View>
    </LinearGradient>
  );
}

function ChartEmpty({ message }: { message: string }) {
  return (
    <View style={styles.chartEmpty}>
      <Ionicons name="stats-chart-outline" size={28} color={Colors.textMuted} />
      <Text style={styles.chartEmptyText}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { marginTop: 8, marginBottom: 16 },
  pageTitle: { fontSize: 24, fontWeight: '800', color: Colors.text },
  subtitle: { fontSize: 13, color: Colors.textSecondary, marginTop: 2 },
  rangeRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  rangeBtn: { paddingHorizontal: 20, paddingVertical: 8, borderRadius: 20, borderWidth: 1.5, borderColor: Colors.border, backgroundColor: Colors.surface },
  rangeBtnActive: { backgroundColor: Colors.primaryLight, borderColor: Colors.primary },
  rangeText: { fontSize: 13, fontWeight: '600', color: Colors.textSecondary },
  rangeTextActive: { color: Colors.primaryDark },
  scroll: { paddingBottom: 30 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  statCard: { flexBasis: '30%', flexGrow: 1, alignItems: 'center', paddingVertical: 16 },
  statValue: { fontSize: 20, fontWeight: '800', color: Colors.text },
  statSub: { fontSize: 12, color: Colors.textMuted, fontWeight: '500' },
  statLabel: { fontSize: 12, color: Colors.textSecondary, marginTop: 4, textAlign: 'center' },
  sectionLabel: { fontSize: 15, fontWeight: '700', color: Colors.text, marginTop: 20, marginBottom: 10 },
  delta: { fontSize: 13, fontWeight: '600', marginTop: 10 },
  deltaUp: { color: Colors.danger },
  deltaDown: { color: Colors.success },
  chartEmpty: { alignItems: 'center', justifyContent: 'center', paddingVertical: 40, gap: 10 },
  chartEmptyText: { color: Colors.textMuted, fontSize: 13, textAlign: 'center' },
  insightCard: { marginTop: 16, padding: 16, backgroundColor: Colors.primaryLight, borderColor: Colors.primary, borderWidth: 1 },
  insightHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 },
  insightTitle: { fontSize: 14, fontWeight: '700', color: Colors.primaryDark },
  insightText: { fontSize: 14, lineHeight: 21, color: Colors.text },
  consistencyCard: {
    marginTop: 16,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.gym.line,
  },
  consistencyHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  consistencyTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  consistencyIcon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  consistencyTitle: { fontSize: 16, fontWeight: '800', color: Colors.gym.ink },
  consistencySub: { fontSize: 12, color: Colors.gym.inkMuted, marginTop: 2 },
  streakChip: { alignItems: 'center', backgroundColor: Colors.gym.bgCardHi, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 6 },
  streakValue: { fontSize: 20, fontWeight: '900', color: Colors.gym.calories },
  streakLabel: { fontSize: 10, color: Colors.gym.inkMuted },
  cellsRow: { flexDirection: 'row', justifyContent: 'space-between' },
  cellWrap: { alignItems: 'center', gap: 4 },
  cell: { width: 16, height: 36, borderRadius: 6 },
  cellLabel: { fontSize: 9, color: Colors.gym.inkDim },
});
