'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  createMovie,
  updateMovie,
  deleteMovie,
} from '@/src/features/movies/api/movies.api';
import { moviesQueryKeys } from './movies.keys';
import { useInvalidateMoviesList } from './use-movies-list';
import type { CreateMovieDTO, UpdateMovieDTO, Movie } from './movies.schema';

export interface UseMovieFormResult {
  create: {
    mutate: (data: CreateMovieDTO) => Promise<Movie>;
    isPending: boolean;
    error: Error | null;
  };
  update: {
    mutate: (id: string, data: UpdateMovieDTO) => Promise<Movie>;
    isPending: boolean;
    error: Error | null;
  };
  delete: {
    mutate: (id: string) => Promise<void>;
    isPending: boolean;
    error: Error | null;
  };
}

/**
 * Mutation hook for movie CRUD operations
 * Handles optimistic updates and cache invalidation
 */
export function useMovieForm(): UseMovieFormResult {
  const queryClient = useQueryClient();
  const invalidateMoviesList = useInvalidateMoviesList();

  // Create movie mutation
  const createMutation = useMutation({
    mutationKey: moviesQueryKeys.create(),
    mutationFn: createMovie,
    onSuccess: async () => {
      // Invalidate list to refetch with new movie
      await invalidateMoviesList();
    },
  });

  // Update movie mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateMovieDTO }) =>
      updateMovie(id, data),
    onSuccess: async (updatedMovie) => {
      // Update the detail cache
      queryClient.setQueryData(
        moviesQueryKeys.detail(updatedMovie.id),
        updatedMovie,
      );
      // Invalidate list to refetch with updated data
      await invalidateMoviesList();
    },
  });

  // Delete movie mutation
  const deleteMutation = useMutation({
    mutationFn: deleteMovie,
    onSuccess: async () => {
      // Invalidate list to refetch
      await invalidateMoviesList();
    },
  });

  return {
    create: {
      mutate: async (data: CreateMovieDTO) => {
        const result = await createMutation.mutateAsync(data);
        return result;
      },
      isPending: createMutation.isPending,
      error: createMutation.error instanceof Error ? createMutation.error : null,
    },
    update: {
      mutate: async (id: string, data: UpdateMovieDTO) => {
        const result = await updateMutation.mutateAsync({ id, data });
        return result;
      },
      isPending: updateMutation.isPending,
      error: updateMutation.error instanceof Error ? updateMutation.error : null,
    },
    delete: {
      mutate: async (id: string) => {
        await deleteMutation.mutateAsync(id);
      },
      isPending: deleteMutation.isPending,
      error: deleteMutation.error instanceof Error ? deleteMutation.error : null,
    },
  };
}
