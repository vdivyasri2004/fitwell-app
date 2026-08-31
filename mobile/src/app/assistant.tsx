import { View, Text, StyleSheet, TextInput, Pressable, FlatList, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useRef, useState, useCallback, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '../components/ui';
import { useAuthStore } from '../store/authStore';
import { useTodayData } from '../hooks/useTodayData';
import { useAIContext } from '../hooks/useAIContext';
import { aiService } from '../services/ai';
import { Colors } from '../constants';

interface ChatMsg {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

const SUGGESTIONS = [
  'What should I eat for dinner?',
  'I have 600 calories left. What can I eat?',
  'I need more protein today. Suggest vegetarian foods.',
  'Give me a 20-minute home workout.',
];

const MEDICAL_NOTE =
  'FitWell provides general wellness and fitness guidance, not medical diagnosis. If you have a health concern, please consult a qualified healthcare professional.';

export default function Assistant() {
  const router = useRouter();
  const today = useTodayData();
  const aiContext = useAIContext(today);
  const [messages, setMessages] = useState<ChatMsg[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content:
        "Hi! I'm your fitness assistant. Ask me anything about your meals, protein, workouts, hydration, or weekly progress. I'll use your goals and today's data to help.",
    },
  ]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [provider, setProvider] = useState('rule');
  const listRef = useRef<FlatList>(null);

  useEffect(() => {
    const label = aiService.isExternalEnabled ? 'AI powered' : 'Rule-based mode';
    setMessages((m) => [
      ...m.filter((x) => x.id !== 'provider'),
      { id: 'provider', role: 'assistant', content: `Assistant mode: ${label}. No API key is required to use FitWell.` },
    ]);
  }, [aiService.isExternalEnabled]);

  const send = useCallback(
    async (textOverride?: string) => {
      const text = (textOverride ?? input).trim();
      if (!text || sending) return;
      setInput('');
      const userMsg: ChatMsg = { id: `u-${Date.now()}`, role: 'user', content: text };
      setMessages((m) => [...m, userMsg]);
      setSending(true);
      try {
        const { text: reply, provider: prov } = await aiService.chat(
          [...messages, userMsg].map((m) => ({ role: m.role, content: m.content })),
          aiContext,
        );
        setProvider(prov);
        setMessages((m) => [
          ...m,
          { id: `a-${Date.now()}`, role: 'assistant', content: reply },
        ]);
      } catch {
        setMessages((m) => [
          ...m,
          { id: `a-${Date.now()}`, role: 'assistant', content: 'Sorry, I could not generate a response right now. Please try again.' },
        ]);
      } finally {
        setSending(false);
      }
    },
    [input, sending, messages, aiContext],
  );

  return (
    <Screen>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} accessibilityLabel="Back" style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={Colors.text} />
        </Pressable>
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={styles.title}>AI Assistant</Text>
          <Text style={styles.subtitle}>{provider === 'external' ? 'AI powered' : 'Rule-based mode'}</Text>
        </View>
      </View>

      <FlatList
        ref={listRef}
        data={messages}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
        ListHeaderComponent={
          messages.length <= 2 ? (
            <View style={styles.suggestions}>
              {SUGGESTIONS.map((s) => (
                <Pressable key={s} onPress={() => send(s)} style={styles.suggestion}>
                  <Text style={styles.suggestionText}>{s}</Text>
                </Pressable>
              ))}
            </View>
          ) : null
        }
        renderItem={({ item }) => (
          <View style={[styles.bubbleRow, item.role === 'user' && styles.bubbleRowUser]}>
            {item.role === 'assistant' && (
              <View style={styles.aiAvatar}>
                <Ionicons name="sparkles" size={16} color={Colors.primaryDark} />
              </View>
            )}
            <View style={[styles.bubble, item.role === 'user' ? styles.userBubble : styles.aiBubble]}>
              <Text style={[styles.bubbleText, item.role === 'user' && styles.userBubbleText]}>{item.content}</Text>
            </View>
          </View>
        )}
      />

      <View style={styles.medicalNote}>
        <Text style={styles.medicalText}>{MEDICAL_NOTE}</Text>
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.inputRow}>
          <TextInput
            value={input}
            onChangeText={setInput}
            placeholder="Ask about meals, protein, workouts..."
            placeholderTextColor={Colors.textMuted}
            style={styles.input}
            multiline
            onSubmitEditing={() => send()}
          />
          <Pressable onPress={() => send()} disabled={sending || !input.trim()} style={[styles.sendBtn, (sending || !input.trim()) && styles.sendBtnDisabled]} accessibilityRole="button" accessibilityLabel="Send">
            {sending ? <ActivityIndicator color="#fff" size="small" /> : <Ionicons name="arrow-up" size={20} color="#fff" />}
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', marginTop: 8, marginBottom: 12 },
  backBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: Colors.surface, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 18, fontWeight: '700', color: Colors.text },
  subtitle: { fontSize: 12, color: Colors.textMuted, marginTop: 1 },
  list: { paddingBottom: 12 },
  suggestions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 14 },
  suggestion: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 16, backgroundColor: Colors.primaryLight, borderWidth: 1, borderColor: Colors.primary },
  suggestionText: { fontSize: 12, color: Colors.primaryDark, fontWeight: '600' },
  bubbleRow: { flexDirection: 'row', alignItems: 'flex-end', marginBottom: 10, gap: 8 },
  bubbleRowUser: { justifyContent: 'flex-end' },
  aiAvatar: { width: 30, height: 30, borderRadius: 15, backgroundColor: Colors.primaryLight, alignItems: 'center', justifyContent: 'center' },
  bubble: { maxWidth: '80%', borderRadius: 16, padding: 12 },
  aiBubble: { backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border },
  userBubble: { backgroundColor: Colors.primary },
  bubbleText: { fontSize: 14, lineHeight: 20, color: Colors.text },
  userBubbleText: { color: '#fff' },
  medicalNote: { padding: 10, marginBottom: 8 },
  medicalText: { fontSize: 11, color: Colors.textMuted, textAlign: 'center', lineHeight: 16 },
  inputRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 8 },
  input: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: Colors.text,
    maxHeight: 100,
  },
  sendBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center' },
  sendBtnDisabled: { opacity: 0.5 },
});
