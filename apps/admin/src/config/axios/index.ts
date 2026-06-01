import axios from 'axios';
import { parseApiError } from '@/src/lib/errors';

function getAccessToken(): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(/(?:^|; )cinema_access_token=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : null;
}

const baseURL = process.env.NEXT_PUBLIC_API_URL;

if (!baseURL && process.env.NODE_ENV !== 'development') {
  throw new Error('NEXT_PUBLIC_API_URL is required');
}

export const apiClient = axios.create({
  baseURL: baseURL ?? 'http://localhost:3001/api',
  headers: { 'Content-Type': 'application/json' },
});

// Inject Bearer token from cookie on every request
apiClient.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Convert every non-2xx response into a typed ApiError
apiClient.interceptors.response.use(
  (response) => response,
  (error: unknown) => Promise.reject(parseApiError(error)),
);
