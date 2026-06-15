import { useMovieForm as useMovieFormHook } from '@/src/domain/movies';

/**
 * ViewModel wrapping the use-movie-form hook from domain layer.
 * Exposes simplified interface for the MovieForm component.
 */
export function useMovieFormViewModel() {
  const {
    createMovie,
    createMovieAsync,
    isCreating,
    createError,
    updateMovie,
    updateMovieAsync,
    isUpdating,
    updateError,
  } = useMovieFormHook();

  return {
    // Create operations
    createMovie,
    createMovieAsync,
    isCreating,
    createError,

    // Update operations
    updateMovie,
    updateMovieAsync,
    isUpdating,
    updateError,

    // Combined loading state
    isLoading: isCreating || isUpdating,
    error: createError || updateError,
  };
}
