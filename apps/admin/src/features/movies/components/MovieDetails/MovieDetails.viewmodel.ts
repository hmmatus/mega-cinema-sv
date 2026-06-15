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
    deleteMovie,
    deleteMovieAsync,
    isDeleting,
    deleteError,
    archiveMovie,
    archiveMovieAsync,
    isArchiving,
    archiveError,
  } = useMovieDetailsHook(movieId, enabled);

  return {
    // Query state
    movie,
    isLoading,
    error,

    // Delete operations
    deleteMovie,
    deleteMovieAsync,
    isDeleting,
    deleteError,

    // Archive operations
    archiveMovie,
    archiveMovieAsync,
    isArchiving,
    archiveError,

    // Combined state
    isActionPending: isDeleting || isArchiving,
    actionError: deleteError || archiveError,
  };
}
