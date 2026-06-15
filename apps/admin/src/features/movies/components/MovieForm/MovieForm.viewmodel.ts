import { useMovieForm as useMovieFormHook } from '@/src/domain/movies';
import type { UseMovieFormResult } from '@/src/domain/movies';

/**
 * ViewModel wrapping the use-movie-form hook from domain layer.
 * Exposes simplified interface for the MovieForm component.
 */
export function useMovieFormViewModel() {
  const movieFormResult = useMovieFormHook();

  return {
    // Return the hook result directly with the expected structure
    result: movieFormResult,

    // Convenience properties
    isLoading: movieFormResult.create.isPending || movieFormResult.update.isPending,
    error: movieFormResult.create.error || movieFormResult.update.error,
  };
}
