import { useMovieDetails as useMovieDetailsHook } from '@/src/domain/movies';

/**
 * ViewModel wrapping the use-movie-details hook from domain layer.
 * Exposes simplified interface for the MovieDetails component.
 */
export function useMovieDetailsViewModel(movieId: string, enabled = true) {
  const {
    movie,
    isLoading,
    error,
    refetch,
  } = useMovieDetailsHook(movieId, enabled);

  return {
    // Query state
    movie,
    isLoading,
    error,
    refetch,
  };
}
