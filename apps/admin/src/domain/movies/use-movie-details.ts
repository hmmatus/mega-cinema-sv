'use client';

import { useQuery } from '@tanstack/react-query';
import { getMovieById } from '@/src/features/movies/api/movies.api';
import { moviesQueryKeys } from './movies.keys';
import type { Movie } from './movies.schema';

export interface UseMovieDetailsOptions {
  enabled?: boolean;
  staleTime?: number;
}

export interface UseMovieDetailsResult {
  movie: Movie | undefined;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

/**
 * Query hook to fetch a single movie by ID
 * Integrates with TanStack Query for caching
 */
export function useMovieDetails(
  id: string,
  options: UseMovieDetailsOptions = {},
): UseMovieDetailsResult {
  const { enabled = true, staleTime = 1000 * 60 * 5 } = options;

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: moviesQueryKeys.detail(id),
    queryFn: () => getMovieById(id),
    enabled: enabled && !!id,
    staleTime,
  });

  return {
    movie: data,
    isLoading,
    isError,
    error: error instanceof Error ? error : null,
    refetch: async () => {
      await refetch();
    },
  };
}
