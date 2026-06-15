import { useMoviesList } from '@/src/domain/movies/use-movies-list';
import type { Movie } from './types';

export interface UseMoviesListViewModelReturn {
  movies: Movie[];
  isLoading: boolean;
  error: Error | null;
  total: number;
  limit: number;
  offset: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  refetch: () => Promise<void>;
}

export function useMoviesListViewModel(): UseMoviesListViewModelReturn {
  const {
    movies,
    isLoading,
    error,
    total,
    limit,
    offset,
    hasNextPage,
    hasPreviousPage,
    refetch,
  } = useMoviesList();

  return {
    movies,
    isLoading,
    error,
    total,
    limit,
    offset,
    hasNextPage,
    hasPreviousPage,
    refetch,
  };
}
