// AI conversations and messages persistence.
import { apiFetch } from './client';
import { AIConversation, AIMessage } from '../../types';

export async function createConversation(_userId: string, title = 'Fitness Assistant'): Promise<AIConversation> {
  return apiFetch<AIConversation>('/api/ai/conversations', {
    method: 'POST',
    body: { title },
  });
}

export async function getConversations(_userId: string): Promise<AIConversation[]> {
  return apiFetch<AIConversation[]>('/api/ai/conversations');
}

export async function getMessages(conversationId: string): Promise<AIMessage[]> {
  return apiFetch<AIMessage[]>(`/api/ai/conversations/${conversationId}/messages`);
}

export async function addMessage(
  conversationId: string,
  role: 'user' | 'assistant',
  content: string,
): Promise<AIMessage> {
  return apiFetch<AIMessage>(`/api/ai/conversations/${conversationId}/messages`, {
    method: 'POST',
    body: { role, content },
  });
}
