import { AIProvider, AIProviderContext } from './types';
import { GLOBAL_GOALS, DIETARY_PREFERENCES } from '../../constants';

const GOAL_TIPS: Record<string, string> = {
  lose_weight:
    'Focus on a high-protein, fiber-rich diet with moderate portions. Stay in a comfortable calorie deficit and keep up consistent movement.',
  build_muscle:
    'Prioritize protein at every meal and progressive strength work. A small calorie surplus supports muscle growth.',
  gain_weight:
    'Add calorie-dense, nutritious foods and strengthen with compound movements. Eat a calorie surplus consistently.',
  maintain:
    'Keep a balanced diet, stay active, and hit your calorie and protein targets consistently.',
};

const SAMPLE_MEALS: Record<string, string[]> = {
  lose_weight: [
    'Greek yogurt with oats and berries (high protein, low calorie)',
    'Vegetable dal with a small portion of brown rice and salad',
    'Grilled chicken or paneer with steamed vegetables',
    'A bowl of mixed vegetable soup',
  ],
  build_muscle: [
    'Eggs or paneer with whole-grain toast',
    'Dal, rice and curd with a side of vegetables',
    'Chicken or tofu bowl with brown rice and greens',
    'Greek yogurt with nuts and banana',
  ],
  gain_weight: [
    'Banana, oats and peanut butter smoothie with milk',
    'Paneer curry with rice and ghee',
    'Chicken curry with rice and a side salad',
    'Whole milk with nuts and dates',
  ],
  maintain: [
    'Oats with milk and fruit',
    'Balanced veg or non-veg thali with grains, dal and salad',
    'Stir-fried vegetables with rice or chapati',
    'Curd and fruit bowl',
  ],
};

export class RuleBasedProvider implements AIProvider {
  readonly name = 'rule';
  available = true;

  private mealIdeas(context: AIProviderContext): string {
    const goal = context.profile.fitness_goal ?? 'maintain';
    const options = SAMPLE_MEALS[goal] ?? SAMPLE_MEALS.maintain;
    return options.map((o) => `- ${o}`).join('\n');
  }

  private buildDailyGuidance(context: AIProviderContext): string {
    const p = context.profile;
    const t = context.today;
    const goalLabel = p.fitness_goal ? GLOBAL_GOALS[p.fitness_goal] ?? p.fitness_goal : 'your goal';
    const dietLabel = p.dietary_preference
      ? DIETARY_PREFERENCES[p.dietary_preference] ?? p.dietary_preference
      : 'your diet';

    let lines: string[] = [];
    lines.push(`Your current goal is **${goalLabel}** with a **${dietLabel}** diet.`);

    if (t && p.calorie_target) {
      const remaining = p.calorie_target - (t.caloriesConsumed ?? 0);
      if (remaining > 0) {
        lines.push(
          `You have about **${remaining} kcal** left for today. Prioritize protein and vegetables to stay satisfied.`,
        );
      } else {
        lines.push(
          `You have met or exceeded today's calorie target. Consider a light activity break and a protein-rich, low-calorie snack if hungry.`,
        );
      }
    }

    if (t && p.protein_target) {
      const proteinLeft = p.protein_target - (t.proteinConsumed ?? 0);
      if (proteinLeft > 0) {
        lines.push(
          `You still need about **${Math.round(proteinLeft)} g** of protein. Good sources for a ${dietLabel.toLowerCase()} diet include dal, paneer, tofu, eggs, curd, and legumes.`,
        );
      } else {
        lines.push('You have met today\'s protein target. Nice work!');
      }
    }

    if (t && p.water_target_ml) {
      const waterLeft = p.water_target_ml - (t.waterConsumed ?? 0);
      if (waterLeft > 0) {
        lines.push(`Drink about **${Math.round(waterLeft / 100) * 100} ml** more water today.`);
      } else {
        lines.push('You are well hydrated today.');
      }
    }

    return lines.join('\n\n');
  }

  async generateRecommendation(context: AIProviderContext, _prompt: string): Promise<string> {
    const tip = context.profile.fitness_goal
      ? GOAL_TIPS[context.profile.fitness_goal] ?? GOAL_TIPS.maintain
      : GOAL_TIPS.maintain;
    return [
      `Here is your daily guidance for **${GLOBAL_GOALS[context.profile.fitness_goal ?? 'maintain'] ?? 'general fitness'}**:`,
      '',
      this.buildDailyGuidance(context),
      '',
      '**Recommended meal ideas:**',
      this.mealIdeas(context),
      '',
      `**Tip:** ${tip}`,
      '',
      '_No AI provider is configured, so these recommendations are generated from your goals, targets and today\'s nutrition data._',
    ].join('\n');
  }

  async chat(
    messages: { role: 'user' | 'assistant'; content: string }[],
    context: AIProviderContext,
  ): Promise<string> {
    return this.generateRecommendation(context, messages[messages.length - 1]?.content ?? '');
  }

  async generateWeeklyInsight(context: AIProviderContext): Promise<string> {
    const parts: string[] = [];
    const weekly = context.weeklyStats ?? {};
    const goal = context.profile.fitness_goal;

    if (weekly.proteinDaysOnTarget) {
      parts.push(
        `You reached your protein target on ${weekly.proteinDaysOnTarget} of ${weekly.daysLogged ?? 7} days.`,
      );
    }
    if (typeof weekly.waterConsistency === 'number') {
      parts.push(
        `Your water intake was consistent on ${Math.round((weekly.waterConsistency / (weekly.daysLogged ?? 7)) * 100)}% of days.`,
      );
    }
    if (weekly.avgSleepMinutes) {
      const goalMin = context.profile.sleep_goal_minutes ?? 480;
      parts.push(
        weekly.avgSleepMinutes >= goalMin
          ? `Your average sleep of about ${Math.round(weekly.avgSleepMinutes / 60)} hours met your goal.`
          : `Your average sleep was below your selected goal of ${Math.round(goalMin / 60)} hours.`,
      );
    }
    if (weekly.workoutCount) {
      parts.push(`You completed ${weekly.workoutCount} workout(s) this period.`);
    }
    if (weekly.avgCalories && context.profile.calorie_target) {
      parts.push(
        `Your average intake was about ${Math.round(weekly.avgCalories)} kcal versus a target of ${context.profile.calorie_target} kcal.`,
      );
    }
    if (goal && weekly.weightDelta !== undefined) {
      if (weekly.weightDelta < -0.5 && goal === 'lose_weight') {
        parts.push('Your weight trend is moving in line with your goal.');
      } else if (weekly.weightDelta > 0.5 && (goal === 'gain_weight' || goal === 'build_muscle')) {
        parts.push('Your weight trend is moving in line with your goal.');
      }
    }

    if (parts.length === 0) {
      return 'Keep logging your activity to unlock more detailed weekly insights.';
    }

    return (
      parts.join('\n') +
      '\n\nKeep making consistent, sustainable choices — small steps add up over time.'
    );
  }
}
