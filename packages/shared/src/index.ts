export type PaginatedResponse<T> = {
  data: T[];
  total: number;
  page: number;
  limit: number;
};

export type ApiResponse<T> = {
  success: boolean;
  data?: T;
  error?: string;
};

export type HealthResponse = {
  status: 'ok' | 'degraded';
  timestamp: string;
};
