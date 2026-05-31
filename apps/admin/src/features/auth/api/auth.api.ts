import { apiClient } from '@/src/config/axios';
import type { AuthUser, LoginResponse } from '../types/auth.types';

export async function login(credentials: {
  email: string;
  password: string;
}): Promise<LoginResponse> {
  const res = await apiClient.post<LoginResponse>('/auth/login', credentials);
  return res.data;
}

export async function getUser(): Promise<AuthUser> {
  const res = await apiClient.get<AuthUser>('/users');
  return res.data;
}
