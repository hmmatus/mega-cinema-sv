import { useMovieDetails as useMovieDetailsHook } from '@/src/domain/movies';
import type { UseMovieDetailsOptions } from '@/src/domain/movies';

/**
 * ViewModel wrapping the use-movie-details hook from domain layer.
 * Exposes simplified interface for the MovieDetails component.
 */
export function useMovieDetailsViewModel(movieId: string, options: UseMovieDetailsOptions = {}) {
  const {
    movie,
    isLoading,
    error,
    refetch,
  } = useMovieDetailsHook(movieId, options);

  return {
    // Query state
    movie,
    isLoading,
    error,
    refetch,
  };
}
