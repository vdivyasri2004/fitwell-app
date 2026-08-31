// HTTP client for the FitWell local backend.
//
// The backend URL is read from EXPO_PUBLIC_API_URL (build-time). When running
// the app via Expo on the same machine as the server, http://localhost:4000
// works. For a physical device, set EXPO_PUBLIC_API_URL to your machine's
// LAN IP (e.g. http://192.168.1.10:4000).

import { storageGet, storageSet, storageRemove } from './storage';

// On native devices the backend URL is set explicitly (a LAN IP via
// EXPO_PUBLIC_API_URL, otherwise http://fitwell.local:4000). On web we derive
// the API host from the page's own origin so login works regardless of whether
// the browser is pointed at localhost or a custom hostname like fitwell.local.
let webBase: string | undefined;
if (typeof window !== 'undefined' && window.location && window.location.hostname) {
  webBase = `${window.location.protocol}//${window.location.hostname}:4000`;
}

export const BASE_URL =
  (typeof window !== 'undefined' ? webBase : undefined) ??
  process.env.EXPO_PUBLIC_API_URL ??
  'http://fitwell.local:4000';
export const isApiConfigured = Boolean(BASE_URL);

const TOKEN_KEY = 'fitwell.auth.token';

export async function getToken(): Promise<string | null> {
  return storageGet(TOKEN_KEY);
}

export async function setToken(token: string | null): Promise<void> {
  if (token) await storageSet(TOKEN_KEY, token);
  else await storageRemove(TOKEN_KEY);
}

export async function clearToken(): Promise<void> {
  await storageRemove(TOKEN_KEY);
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

export async function apiFetch<T = unknown>(
  path: string,
  options: FetchOptions = {},
): Promise<T> {
  const token = await getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${path}`, {
    method: options.method || 'GET',
    headers,
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
  });

  if (res.status === 204) return null as T;

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
