import { AIProvider, AIProviderContext } from './types';
import { RuleBasedProvider } from './ruleBasedProvider';
import { ExternalAIProvider } from './externalAIProvider';

export { RuleBasedProvider, ExternalAIProvider };
export type { AIProvider, AIProviderContext };

class AIService {
  private ruleBased: RuleBasedProvider;
  private external: ExternalAIProvider | null;

  constructor() {
    this.ruleBased = new RuleBasedProvider();
    this.external = null;
  }

  /** Attempt to use external AI; falls back to rule-based and reports which was used. */
  enableExternal(enabled: boolean) {
    this.external = enabled ? new ExternalAIProvider() : null;
  }

  get activeProvider(): AIProvider {
    return this.external?.available ? this.external : this.ruleBased;
  }

  get isExternalEnabled(): boolean {
    return Boolean(this.external?.available);
  }

  async generateRecommendation(context: AIProviderContext, prompt: string): Promise<{ text: string; provider: string }> {
    const provider = this.activeProvider;
    const text = await provider.generateRecommendation(context, prompt);
    return { text, provider: provider.name };
  }

  async chat(
    messages: { role: 'user' | 'assistant'; content: string }[],
    context: AIProviderContext,
  ): Promise<{ text: string; provider: string }> {
    const provider = this.activeProvider;
    const text = await provider.chat(messages, context);
    return { text, provider: provider.name };
  }

  async generateWeeklyInsight(context: AIProviderContext): Promise<{ text: string; provider: string }> {
    const provider = this.activeProvider;
    const text = await provider.generateWeeklyInsight(context);
    return { text, provider: provider.name };
  }
}

export const aiService = new AIService();
