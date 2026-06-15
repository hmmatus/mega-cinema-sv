'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getMovies } from '@/src/features/movies/api/movies.api';
import { moviesQueryKeys } from './movies.keys';
import type { GetMoviesParams, Movie } from './movies.schema';

export interface UseMoviesListOptions extends Partial<GetMoviesParams> {
  enabled?: boolean;
  staleTime?: number;
}

export interface UseMoviesListResult {
  movies: Movie[];
  total: number;
  limit: number;
  offset: number;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

/**
 * Query hook to fetch paginated movies with optional filters
 * Integrates with TanStack Query for caching and sync
 */
export function useMoviesList(
  options: UseMoviesListOptions = {},
): UseMoviesListResult {
  const {
    enabled = true,
    staleTime = 1000 * 60 * 5, // 5 minutes
    limit = 10,
    offset = 0,
    search,
    status,
    visibility,
    fromDate,
    toDate,
  } = options;

  const queryClient = useQueryClient();

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: moviesQueryKeys.list({
      limit,
      offset,
      search,
      status,
      visibility,
      fromDate,
      toDate,
    }),
    queryFn: () =>
      getMovies({
        limit,
        offset,
        search,
        status,
        visibility,
        fromDate,
        toDate,
      }),
    enabled,
    staleTime,
  });

  const movies = data?.data ?? [];
  const total = data?.total ?? 0;
  const hasNextPage = offset + limit < total;
  const hasPreviousPage = offset > 0;

  return {
    movies,
    total,
    limit,
    offset,
    isLoading,
    isError,
    error: error instanceof Error ? error : null,
    refetch: async () => {
      await refetch();
    },
    hasNextPage,
    hasPreviousPage,
  };
}

/**
 * Helper to invalidate movies list cache
 * Call this after mutations (create, update, delete)
 */
export function useInvalidateMoviesList() {
  const queryClient = useQueryClient();

  return async () => {
    await queryClient.invalidateQueries({
      queryKey: moviesQueryKeys.lists(),
    });
  };
}
