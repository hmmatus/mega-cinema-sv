import { apiFetch } from '@/src/lib/http-client';
import type { AuthUser, LoginResponse } from '../types/auth.types';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api';

export async function login(credentials: {
  email: string;
  password: string;
}): Promise<LoginResponse> {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials),
  });

  if (!res.ok) {
    let message = 'Error de autenticación';
    try {
      const body = (await res.json()) as { message?: string };
      if (body.message) message = body.message;
    } catch {
      // ignore parse error
    }
    throw new Error(message);
  }

  return res.json() as Promise<LoginResponse>;
}

export async function getUser(): Promise<AuthUser> {
  return apiFetch<AuthUser>('/users');
}
