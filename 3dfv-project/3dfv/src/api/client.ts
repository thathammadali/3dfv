/**
 * src/api/client.ts
 *
 * Central Axios instance for all backend calls.
 *
 * - Base URL is read from app.config.js → expo.extra.apiBaseUrl
 * - Every outgoing request automatically adds `Authorization: Bearer <token>`
 *   if a token is stored in SecureStore.
 * - Responses follow the backend envelope:
 *     { success: boolean, message: string, data: T }
 *   so helpers should read `response.data.data` for the payload.
 */
import axios from 'axios';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { getToken } from '../services/tokenStorage';

function resolveApiBaseUrl() {
  const configured = Constants.expoConfig?.extra?.apiBaseUrl as string | undefined;

  if (Platform.OS === 'web' && (!configured || configured.includes('localhost:8000'))) {
    return 'http://127.0.0.1:8001';
  }

  return configured || 'http://127.0.0.1:8001';
}

// Resolve base URL: expo config extra -> local backend fallback
const API_BASE_URL: string =
  resolveApiBaseUrl();

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// ─── Request Interceptor ────────────────────────────────────────────────────
// Attach JWT token to every request if one is stored.
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await getToken();
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch {
      // SecureStore unavailable (e.g. web) — skip silently
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── Response Interceptor ───────────────────────────────────────────────────
// Log 401 errors for debugging. Callers handle UI feedback themselves.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.warn('[API] 401 Unauthorized — token may be expired');
    }
    return Promise.reject(error);
  }
);

export default api;
export { API_BASE_URL };
