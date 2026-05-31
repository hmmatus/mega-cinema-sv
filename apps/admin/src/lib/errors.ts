import axios from 'axios';

export interface ProblemDetail {
  type: string;
  title: string;
  status: number;
  message: string;
  instance?: string;
  details?: Array<{ field: string; message: string }>;
}

export class ApiError extends Error {
  readonly type: string;
  readonly title: string;
  readonly status: number;
  readonly instance?: string;
  readonly details?: Array<{ field: string; message: string }>;

  constructor(problem: ProblemDetail) {
    super(problem.message);
    this.name = 'ApiError';
    this.type = problem.type;
    this.title = problem.title;
    this.status = problem.status;
    this.instance = problem.instance;
    this.details = problem.details;
  }
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}

/**
 * Converts any caught value into a typed ApiError.
 * Validates the response body against ProblemDetail shape.
 * Falls back to status 0 for network-level failures (no response).
 */
export function parseApiError(error: unknown): ApiError {
  if (axios.isAxiosError(error) && error.response) {
    const data = error.response.data as Partial<ProblemDetail> | undefined;
    return new ApiError({
      type: data?.type ?? 'about:blank',
      title: data?.title ?? error.response.statusText,
      status: error.response.status,
      message: data?.message ?? error.message,
      instance: data?.instance,
      details: data?.details,
    });
  }

  // Network error / timeout / CORS — no HTTP response received
  return new ApiError({
    type: 'about:blank',
    title: 'Network Error',
    status: 0,
    message: error instanceof Error ? error.message : 'Error de conexión. Intentá de nuevo.',
  });
}
