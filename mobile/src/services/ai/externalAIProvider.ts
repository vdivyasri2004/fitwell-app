import { AIProvider, AIProviderContext } from './types';
import { apiFetch, isApiConfigured } from '../api/client';

// When true (EXPO_PUBLIC_AI_ENABLED=1), the app will try server-side AI
// generation. The server holds the real AI key and returns 501 when it has none,
// which signals the app to fall back to its rule-based provider.
const aiEnabled = process.env.EXPO_PUBLIC_AI_ENABLED === '1';

/**
 * ExternalAIProvider calls a secure server-side endpoint (/api/ai/generate)
 * which holds the real AI API key. The mobile app never contains the key.
 * When no AI provider is configured server-side, generation returns 501 and we
 * surface that so the app falls back to rule-based recommendations.
 */
export class ExternalAIProvider implements AIProvider {
  readonly name = 'external';
  available = isApiConfigured && aiEnabled;

  private async callFunction<T>(
    action: 'recommendation' | 'chat' | 'weekly_insight',
    payload: Record<string, unknown>,
  ): Promise<T> {
    if (!this.available) {
      throw new Error('AI not configured');
    }
    return apiFetch<T>('/api/ai/generate', {
      method: 'POST',
      body: { action, ...payload },
    });
  }

  async generateRecommendation(context: AIProviderContext, prompt: string): Promise<string> {
    const res = await this.callFunction<{ text: string }>('recommendation', { prompt, context });
    return res.text;
  }

  async chat(
    messages: { role: 'user' | 'assistant'; content: string }[],
    context: AIProviderContext,
  ): Promise<string> {
    const res = await this.callFunction<{ text: string }>('chat', { messages, context });
    return res.text;
  }

  async generateWeeklyInsight(context: AIProviderContext): Promise<string> {
    const res = await this.callFunction<{ text: string }>('weekly_insight', { context });
    return res.text;
  }
}
