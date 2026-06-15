import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useMovieDetails } from './use-movie-details';
import * as moviesApi from '@/src/features/movies/api/movies.api';
import type { Movie } from './movies.schema';

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
  cast: ['Keanu Reeves', 'Laurence Fishburne'],
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
    },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

describe('useMovieDetails', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch a single movie', async () => {
    vi.mocked(moviesApi.getMovieById).mockResolvedValueOnce(mockMovie);

    const { result } = renderHook(
      () => useMovieDetails(mockMovie.id),
      { wrapper: createWrapper() },
    );

    expect(result.current.isLoading).toBe(true);
    expect(result.current.movie).toBeUndefined();

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.movie).toEqual(mockMovie);
    expect(moviesApi.getMovieById).toHaveBeenCalledWith(mockMovie.id);
  });

  it('should handle error state', async () => {
    const error = new Error('Failed to fetch movie');
    vi.mocked(moviesApi.getMovieById).mockRejectedValueOnce(error);

    const { result } = renderHook(
      () => useMovieDetails(mockMovie.id),
      { wrapper: createWrapper() },
    );

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error).toEqual(error);
    expect(result.current.movie).toBeUndefined();
  });

  it('should be disableable', async () => {
    vi.mocked(moviesApi.getMovieById).mockResolvedValueOnce(mockMovie);

    const { result } = renderHook(
      () => useMovieDetails(mockMovie.id, { enabled: false }),
      { wrapper: createWrapper() },
    );

    expect(result.current.isLoading).toBe(false);
    expect(moviesApi.getMovieById).not.toHaveBeenCalled();
  });

  it('should not fetch if id is empty', async () => {
    vi.mocked(moviesApi.getMovieById).mockResolvedValueOnce(mockMovie);

    const { result } = renderHook(
      () => useMovieDetails(''),
      { wrapper: createWrapper() },
    );

    expect(result.current.isLoading).toBe(false);
    expect(moviesApi.getMovieById).not.toHaveBeenCalled();
  });

  it('should provide refetch function', async () => {
    vi.mocked(moviesApi.getMovieById).mockResolvedValueOnce(mockMovie);

    const { result } = renderHook(
      () => useMovieDetails(mockMovie.id),
      { wrapper: createWrapper() },
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    vi.mocked(moviesApi.getMovieById).mockResolvedValueOnce(mockMovie);

    await result.current.refetch();

    expect(moviesApi.getMovieById).toHaveBeenCalledTimes(2);
  });

  it('should use custom staleTime option', async () => {
    vi.mocked(moviesApi.getMovieById).mockResolvedValueOnce(mockMovie);

    renderHook(
      () => useMovieDetails(mockMovie.id, { staleTime: 1000 * 60 * 10 }),
      { wrapper: createWrapper() },
    );

    await waitFor(() => {
      expect(moviesApi.getMovieById).toHaveBeenCalled();
    });
  });
});
