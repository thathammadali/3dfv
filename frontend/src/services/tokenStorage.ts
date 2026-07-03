/**
 * src/services/tokenStorage.ts
 *
 * Thin wrapper around expo-secure-store for JWT token management.
 * Falls back gracefully when SecureStore is unavailable (e.g. web).
 */
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const TOKEN_KEY = 'access_token';
const USER_KEY = 'current_user';

function getBrowserStorage(): Storage | null {
  try {
    return typeof globalThis.localStorage === 'undefined' ? null : globalThis.localStorage;
  } catch {
    return null;
  }
}

export async function saveToken(token: string): Promise<void> {
  if (Platform.OS === 'web') {
    getBrowserStorage()?.setItem(TOKEN_KEY, token);
    return;
  }
  try {
    await SecureStore.setItemAsync(TOKEN_KEY, token);
  } catch (e) {
    console.warn('[TokenStorage] saveToken failed', e);
  }
}

export async function getToken(): Promise<string | null> {
  if (Platform.OS === 'web') {
    return getBrowserStorage()?.getItem(TOKEN_KEY) ?? null;
  }
  try {
    return await SecureStore.getItemAsync(TOKEN_KEY);
  } catch (e) {
    console.warn('[TokenStorage] getToken failed', e);
    return null;
  }
}

export async function clearToken(): Promise<void> {
  if (Platform.OS === 'web') {
    const storage = getBrowserStorage();
    storage?.removeItem(TOKEN_KEY);
    storage?.removeItem(USER_KEY);
    return;
  }
  try {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    await SecureStore.deleteItemAsync(USER_KEY);
  } catch (e) {
    console.warn('[TokenStorage] clearToken failed', e);
  }
}

export async function saveUser(user: object): Promise<void> {
  if (Platform.OS === 'web') {
    getBrowserStorage()?.setItem(USER_KEY, JSON.stringify(user));
    return;
  }
  try {
    await SecureStore.setItemAsync(USER_KEY, JSON.stringify(user));
  } catch (e) {
    console.warn('[TokenStorage] saveUser failed', e);
  }
}

export async function getStoredUser<T>(): Promise<T | null> {
  if (Platform.OS === 'web') {
    const raw = getBrowserStorage()?.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as T) : null;
  }
  try {
    const raw = await SecureStore.getItemAsync(USER_KEY);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch (e) {
    console.warn('[TokenStorage] getStoredUser failed', e);
    return null;
  }
}
