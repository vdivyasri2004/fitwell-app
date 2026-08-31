// HTTP client for the FitWell local backend (admin dashboard).
// Stores the JWT in localStorage and attaches it to every request.

export const API_URL = (import.meta.env.VITE_API_URL as string) ?? 'http://fitwell.local:4000';
export const isConfigured = Boolean(API_URL);

const TOKEN_KEY = 'fitwell.admin.token';

export function getToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setToken(token: string | null): void {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  } catch {
    // ignore
  }
}

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

interface FetchOptions {
  method?: string;
  body?: unknown;
  headers?: Record<string, string>;
}

export async function apiFetch<T = unknown>(path: string, options: FetchOptions = {}): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_URL}${path}`, {
    method: options.method || 'GET',
    headers,
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
  });

  if (res.status === 204) return undefined as T;

  let data: unknown = null;
  try {
    data = await res.json();
  } catch {
    // non-JSON body
  }

  if (!res.ok) {
    const message =
      (data && typeof data === 'object' && 'error' in data
        ? (data as { error: string }).error
        : null) || `Request failed (${res.status})`;
    throw new ApiError(res.status, message);
  }

  return data as T;
}

export interface AuthUser {
  id: string;
  email: string;
  full_name: string;
  role: string;
}

export async function signIn(email: string, password: string): Promise<AuthUser> {
  const res = await apiFetch<{ token: string; user: AuthUser }>('/api/auth/login', {
    method: 'POST',
    body: { email, password },
  });
  setToken(res.token);
  return res.user;
}

export async function signOutLocal(): Promise<void> {
  setToken(null);
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  try {
    const res = await apiFetch<{ user: AuthUser }>('/api/auth/me');
    return res.user;
  } catch {
    return null;
  }
}
