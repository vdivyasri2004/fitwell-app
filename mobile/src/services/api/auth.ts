// Auth flows against the local backend. On success, the returned token is
// persisted so the app can restore the session on next launch via /auth/me.

import { apiFetch, setToken, clearToken } from './client';

export interface AuthUser {
  id: string;
  email: string;
  full_name: string;
  role: string;
}

interface AuthResponse {
  token: string;
  user: AuthUser;
}

interface MeResponse {
  user: AuthUser;
}

export async function login(email: string, password: string): Promise<AuthUser> {
  const res = await apiFetch<AuthResponse>('/api/auth/login', {
    method: 'POST',
    body: { email, password },
  });
  await setToken(res.token);
  return res.user;
}

export async function register(
  email: string,
  password: string,
  fullName: string,
): Promise<AuthUser> {
  const res = await apiFetch<AuthResponse>('/api/auth/register', {
    method: 'POST',
    body: { email, password, full_name: fullName },
  });
  await setToken(res.token);
  return res.user;
}

// Restore the current user from the stored token. Returns null if none/unauthenticated.
export async function getCurrentUser(): Promise<AuthUser | null> {
  try {
    const res = await apiFetch<MeResponse>('/api/auth/me');
    return res.user;
  } catch {
    return null;
  }
}

export async function signOut(): Promise<void> {
  await clearToken();
}

export async function requestPasswordReset(email: string): Promise<{ reset_url?: string }> {
  return apiFetch('/api/auth/forgot-password', {
    method: 'POST',
    body: { email },
  });
}

export async function resetPassword(token: string, password: string): Promise<void> {
  await apiFetch('/api/auth/reset-password', {
    method: 'POST',
    body: { token, password },
  });
}
