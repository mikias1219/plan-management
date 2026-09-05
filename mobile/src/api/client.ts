import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { create } from 'zustand';
import type { AuthUser } from '../types';

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:4000/api';

async function storeGet(key: string) {
  if (Platform.OS === 'web') {
    return globalThis.localStorage?.getItem(key) ?? null;
  }
  return SecureStore.getItemAsync(key);
}

async function storeSet(key: string, value: string) {
  if (Platform.OS === 'web') {
    globalThis.localStorage?.setItem(key, value);
    return;
  }
  await SecureStore.setItemAsync(key, value);
}

async function storeDel(key: string) {
  if (Platform.OS === 'web') {
    globalThis.localStorage?.removeItem(key);
    return;
  }
  await SecureStore.deleteItemAsync(key);
}

interface SessionState {
  user: AuthUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  hydrated: boolean;
  setSession: (input: { user: AuthUser; accessToken: string; refreshToken: string }) => Promise<void>;
  clear: () => Promise<void>;
  hydrate: () => Promise<void>;
}

export const useSession = create<SessionState>((set) => ({
  user: null,
  accessToken: null,
  refreshToken: null,
  hydrated: false,
  setSession: async ({ user, accessToken, refreshToken }) => {
    await storeSet('accessToken', accessToken);
    await storeSet('refreshToken', refreshToken);
    await storeSet('user', JSON.stringify(user));
    set({ user, accessToken, refreshToken, hydrated: true });
  },
  clear: async () => {
    await storeDel('accessToken');
    await storeDel('refreshToken');
    await storeDel('user');
    set({ user: null, accessToken: null, refreshToken: null, hydrated: true });
  },
  hydrate: async () => {
    const accessToken = await storeGet('accessToken');
    const refreshToken = await storeGet('refreshToken');
    const rawUser = await storeGet('user');
    set({
      accessToken,
      refreshToken,
      user: rawUser ? (JSON.parse(rawUser) as AuthUser) : null,
      hydrated: true,
    });
  },
}));

export class ApiError extends Error {
  code: string;
  constructor(code: string, message: string) {
    super(message);
    this.code = code;
  }
}

async function parse(res: Response) {
  const json = (await res.json()) as {
    success: boolean;
    data?: unknown;
    error?: { code: string; message: string };
  };
  if (!json.success) {
    throw new ApiError(json.error?.code ?? 'ERROR', json.error?.message ?? 'Request failed');
  }
  return ('data' in json ? json.data : json) as unknown;
}

export async function api<T>(path: string, init: RequestInit = {}, retry = true): Promise<T> {
  const { accessToken, refreshToken, setSession, clear } = useSession.getState();
  const headers = new Headers(init.headers);
  headers.set('Content-Type', 'application/json');
  if (accessToken) {
    headers.set('Authorization', `Bearer ${accessToken}`);
  }

  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, { ...init, headers });
  } catch {
    throw new ApiError('NETWORK', "You're offline. Your activity is saved and will sync later.");
  }

  if (res.status === 401 && retry && refreshToken) {
    const refreshed = await fetch(`${API_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });
    if (!refreshed.ok) {
      await clear();
      throw new ApiError('UNAUTHORIZED', 'Please sign in again');
    }
    const data = (await parse(refreshed)) as {
      accessToken: string;
      refreshToken: string;
      user: AuthUser;
    };
    await setSession(data);
    return api<T>(path, init, false);
  }

  return (await parse(res)) as T;
}

export const apiUrl = API_URL;
