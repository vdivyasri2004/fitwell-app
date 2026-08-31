// FitWell "ai" Edge Function
//
// Secure server-side AI gateway. The mobile app calls this function (never an
// LLM API directly) so any API keys live only in Edge Function secrets.
//
// Actions:
//   - recommendation  -> context + prompt -> recommendation text
//   - chat            -> messages + context -> assistant reply
//   - weekly_insight  -> context -> weekly summary
//
// If an LLM API key is not configured, the function degrades gracefully and
// returns a short server-side message so the app can keep working.
//
// Secrets (Edge Function secrets):
//   AI_API_KEY  - OpenAI-compatible API key (optional)
//   AI_BASE_URL - default https://api.openai.com/v1
//   AI_MODEL    - default gpt-4o-mini

import {
  createClient,
  SupabaseClient,
} from 'https://esm.sh/@supabase/supabase-js@2';

const AI_KEY = Deno.env.get('AI_API_KEY');
const AI_BASE_URL = Deno.env.get('AI_BASE_URL') ?? 'https://api.openai.com/v1';
const AI_MODEL = Deno.env.get('AI_MODEL') ?? 'gpt-4o-mini';

function buildSystemMessage(action: string): string {
  const base =
    'You are FitWell, a helpful, non-medical fitness and wellness coach. ' +
    'Give concise, practical, encouraging advice. Never diagnose or prescribe. ' +
    'Emphasize that calorie and nutrition values are estimates and that users ' +
    'should consult a professional for medical advice. Keep replies short.';

  if (action === 'weekly_insight') {
    return (
      base +
      ' Summarize the user\'s weekly stats into a short friendly insight (2-4 sentences).'
    );
  }
  return base;
}

function fallback(action: string): string {
  if (action === 'weekly_insight') {
    return 'Keep logging your activity to unlock more detailed weekly insights. (External AI is not configured.)';
  }
  return 'I\'m here to support your fitness journey. External AI is not configured yet, so I can help with basic guidance when you describe your goals.';
}

Deno.serve(async (req: Request) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization') ?? '';
    const supabase = createSupabaseClient(authHeader);

    // Verify the caller is an authenticated user.
    const { data: { user }, error: authErr } = await supabase.auth.getUser();
    if (authErr || !user) {
      return json(401, { error: 'Unauthorized' }, corsHeaders);
    }

    const body = await req.json();
    const action: string = body.action ?? 'recommendation';

    // If requested, verify admin server-side (never trust the client).
    if (body.checkAdmin) {
      const isAdmin = await checkIsAdmin(supabase, user.id);
      if (!isAdmin) {
        return json(403, { error: 'Admin access required' }, corsHeaders);
      }
    }

    let text: string;
    if (!AI_KEY) {
      text = fallback(action);
    } else {
      text = await callLLM(action, body);
    }

    return json(200, { text }, corsHeaders);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return json(500, { error: message }, corsHeaders);
  }
});

function createSupabaseClient(authHeader: string): SupabaseClient {
  const url = Deno.env.get('SUPABASE_URL')!;
  const key = Deno.env.get('SUPABASE_ANON_KEY')!;
  const headers = authHeader ? { Authorization: authHeader } : {};
  return createClient(url, key, { global: { headers } });
}

async function checkIsAdmin(client: SupabaseClient, userId: string): Promise<boolean> {
  const { data, error } = await client
    .from('user_roles')
    .select('role')
    .eq('user_id', userId)
    .maybeSingle();
  if (error || !data) return false;
  return data.role === 'admin';
}

async function callLLM(action: string, body: Record<string, unknown>): Promise<string> {
  const system = buildSystemMessage(action);

  let messages: { role: string; content: string }[];
  if (action === 'chat') {
    messages = [{ role: 'system', content: system }, ...(body.messages ?? [])];
  } else {
    const context = String((body.context as Record<string, unknown> | undefined)?.profile?.full_name ?? 'there');
    const prompt = String(body.prompt ?? '');
    const content = action === 'weekly_insight'
      ? `Here is the user's recent weekly stats: ${JSON.stringify(body.context)}. Write a short encouraging weekly insight for the user.`
      : `The user's profile: ${JSON.stringify(body.context)}. Help them with: ${prompt}`;
    messages = [
      { role: 'system', content: system },
      { role: 'user', content: `Hi ${context}. ${content}` },
    ];
  }

  const res = await fetch(`${AI_BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${AI_KEY}`,
    },
    body: JSON.stringify({
      model: AI_MODEL,
      messages,
      max_tokens: 400,
      temperature: 0.7,
    }),
  });

  if (!res.ok) {
    const detail = await res.text();
    throw new Error(`LLM request failed: ${res.status} ${detail}`);
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content?.trim() ?? 'Sorry, I could not generate a response.';
}

function json(status: number, payload: unknown, headers: Record<string, string>) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { ...headers, 'Content-Type': 'application/json' },
  });
}
