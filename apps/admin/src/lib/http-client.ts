import { apiClient } from '@/src/config/axios';
import type { AxiosRequestConfig } from 'axios';

export async function apiFetch<T>(path: string, config?: AxiosRequestConfig): Promise<T> {
  const res = await apiClient.request<T>({ url: path, ...config });
  return res.data;
}
