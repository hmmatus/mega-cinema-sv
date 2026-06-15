import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useMovieForm } from './use-movie-form';
import * as moviesApi from '@/src/features/movies/api/movies.api';
import type { Movie, CreateMovieDTO } from './movies.schema';

vi.mock('@/src/features/movies/api/movies.api');

const mockMovie: Movie = {
  id: '550e8400-e29b-41d4-a716-446655440000',
  title: 'The Matrix',
  description: 'A sci-fi classic',
  durationMinutes: 136,
  rating: 'R',
  originalLanguage: 'English',
  status: 'RELEASED',
  releaseDate: new Date('1999-03-31'),
  posterUrl: 'https://example.com/poster.jpg',
  trailerUrl: 'https://example.com/trailer.mp4',
  director: 'Lana Wachowski, Lilly Wachowski',
  genres: ['Sci-Fi', 'Action'],
  cast: ['Keanu Reeves'],
  featured: true,
  visibility: 'PUBLIC',
  metadata: null,
  createdById: '550e8400-e29b-41d4-a716-446655440001',
  updatedById: '550e8400-e29b-41d4-a716-446655440001',
  createdAt: new Date('2026-06-01'),
  updatedAt: new Date('2026-06-01'),
};

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

describe('useMovieForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new movie', async () => {
      const createData: CreateMovieDTO = {
        title: 'New Movie',
        durationMinutes: 120,
        status: 'UPCOMING',
        visibility: 'PUBLIC',
        genres: [],
        cast: [],
        featured: false,
      };

      vi.mocked(moviesApi.createMovie).mockResolvedValueOnce(mockMovie);

      const { result } = renderHook(() => useMovieForm(), {
        wrapper: createWrapper(),
      });

      expect(result.current.create.isPending).toBe(false);

      const promise = result.current.create.mutate(createData);

      await waitFor(() => {
        expect(result.current.create.isPending).toBe(true);
      });

      const createdMovie = await promise;

      await waitFor(() => {
        expect(result.current.create.isPending).toBe(false);
      });

      expect(createdMovie).toEqual(mockMovie);
      expect(moviesApi.createMovie).toHaveBeenCalledWith(createData);
    });

    it('should handle create error', async () => {
      const createData: CreateMovieDTO = {
        title: 'New Movie',
        durationMinutes: 120,
        status: 'UPCOMING',
        visibility: 'PUBLIC',
        genres: [],
        cast: [],
        featured: false,
      };

      const error = new Error('Failed to create movie');
      vi.mocked(moviesApi.createMovie).mockRejectedValueOnce(error);

      const { result } = renderHook(() => useMovieForm(), {
        wrapper: createWrapper(),
      });

      try {
        await result.current.create.mutate(createData);
      } catch {
        // Expected to throw
      }

      await waitFor(() => {
        expect(result.current.create.isPending).toBe(false);
      });

      expect(result.current.create.error).toEqual(error);
    });
  });

  describe('update', () => {
    it('should update an existing movie', async () => {
      const updateData = { title: 'Updated Title' };

      const updatedMovie = { ...mockMovie, title: 'Updated Title' };
      vi.mocked(moviesApi.updateMovie).mockResolvedValueOnce(updatedMovie);

      const { result } = renderHook(() => useMovieForm(), {
        wrapper: createWrapper(),
      });

      expect(result.current.update.isPending).toBe(false);

      const promise = result.current.update.mutate(mockMovie.id, updateData);

      await waitFor(() => {
        expect(result.current.update.isPending).toBe(true);
      });

      const updated = await promise;

      await waitFor(() => {
        expect(result.current.update.isPending).toBe(false);
      });

      expect(updated.title).toBe('Updated Title');
      expect(moviesApi.updateMovie).toHaveBeenCalledWith(mockMovie.id, updateData);
    });

    it('should handle update error', async () => {
      const updateData = { title: 'Updated Title' };
      const error = new Error('Failed to update movie');

      vi.mocked(moviesApi.updateMovie).mockRejectedValueOnce(error);

      const { result } = renderHook(() => useMovieForm(), {
        wrapper: createWrapper(),
      });

      try {
        await result.current.update.mutate(mockMovie.id, updateData);
      } catch {
        // Expected to throw
      }

      await waitFor(() => {
        expect(result.current.update.isPending).toBe(false);
      });

      expect(result.current.update.error).toEqual(error);
    });
  });

  describe('delete', () => {
    it('should delete a movie', async () => {
      vi.mocked(moviesApi.deleteMovie).mockResolvedValueOnce();

      const { result } = renderHook(() => useMovieForm(), {
        wrapper: createWrapper(),
      });

      expect(result.current.delete.isPending).toBe(false);

      const promise = result.current.delete.mutate(mockMovie.id);

      await waitFor(() => {
        expect(result.current.delete.isPending).toBe(true);
      });

      await promise;

      await waitFor(() => {
        expect(result.current.delete.isPending).toBe(false);
      });

      expect(moviesApi.deleteMovie).toHaveBeenCalledWith(mockMovie.id);
    });

    it('should handle delete error', async () => {
      const error = new Error('Failed to delete movie');
      vi.mocked(moviesApi.deleteMovie).mockRejectedValueOnce(error);

      const { result } = renderHook(() => useMovieForm(), {
        wrapper: createWrapper(),
      });

      try {
        await result.current.delete.mutate(mockMovie.id);
      } catch {
        // Expected to throw
      }

      await waitFor(() => {
        expect(result.current.delete.isPending).toBe(false);
      });

      expect(result.current.delete.error).toEqual(error);
    });
  });
});
