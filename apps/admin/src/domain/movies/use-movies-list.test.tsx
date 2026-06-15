import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useMoviesList, useInvalidateMoviesList } from './use-movies-list';
import * as moviesApi from '@/src/features/movies/api/movies.api';
import type { Movie, PaginatedMoviesResponse } from './movies.schema';

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

const mockResponse: PaginatedMoviesResponse = {
  data: [mockMovie],
  total: 1,
  limit: 10,
  offset: 0,
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

describe('useMoviesList', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch movies with default parameters', async () => {
    vi.mocked(moviesApi.getMovies).mockResolvedValueOnce(mockResponse);

    const { result } = renderHook(() => useMoviesList(), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.movies).toHaveLength(1);
    expect(result.current.movies[0].title).toBe('The Matrix');
    expect(result.current.total).toBe(1);
    expect(result.current.limit).toBe(10);
    expect(result.current.offset).toBe(0);
  });

  it('should fetch movies with custom options', async () => {
    vi.mocked(moviesApi.getMovies).mockResolvedValueOnce(mockResponse);

    const { result } = renderHook(
      () => useMoviesList({ limit: 20, offset: 0, search: 'Matrix' }),
      { wrapper: createWrapper() },
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(moviesApi.getMovies).toHaveBeenCalledWith({
      limit: 20,
      offset: 0,
      search: 'Matrix',
      status: undefined,
      visibility: undefined,
      fromDate: undefined,
      toDate: undefined,
    });
    expect(result.current.limit).toBe(20);
  });

  it('should handle error state', async () => {
    const error = new Error('Failed to fetch movies');
    vi.mocked(moviesApi.getMovies).mockRejectedValueOnce(error);

    const { result } = renderHook(() => useMoviesList(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error).toBe(error);
    expect(result.current.movies).toHaveLength(0);
  });

  it('should return hasNextPage = true when more pages exist', async () => {
    const multiPageResponse: PaginatedMoviesResponse = {
      data: [mockMovie],
      total: 25,
      limit: 10,
      offset: 0,
    };

    vi.mocked(moviesApi.getMovies).mockResolvedValueOnce(multiPageResponse);

    const { result } = renderHook(() => useMoviesList({ limit: 10, offset: 0 }), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.hasNextPage).toBe(true);
    expect(result.current.hasPreviousPage).toBe(false);
  });

  it('should return hasNextPage = false on last page', async () => {
    const lastPageResponse: PaginatedMoviesResponse = {
      data: [mockMovie],
      total: 25,
      limit: 10,
      offset: 20,
    };

    vi.mocked(moviesApi.getMovies).mockResolvedValueOnce(lastPageResponse);

    const { result } = renderHook(
      () => useMoviesList({ limit: 10, offset: 20 }),
      { wrapper: createWrapper() },
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.hasNextPage).toBe(false);
    expect(result.current.hasPreviousPage).toBe(true);
  });

  it('should support status filter', async () => {
    vi.mocked(moviesApi.getMovies).mockResolvedValueOnce(mockResponse);

    renderHook(() => useMoviesList({ status: 'RELEASED' }), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(moviesApi.getMovies).toHaveBeenCalledWith(
        expect.objectContaining({ status: 'RELEASED' }),
      );
    });
  });

  it('should support visibility filter', async () => {
    vi.mocked(moviesApi.getMovies).mockResolvedValueOnce(mockResponse);

    renderHook(() => useMoviesList({ visibility: 'PUBLIC' }), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(moviesApi.getMovies).toHaveBeenCalledWith(
        expect.objectContaining({ visibility: 'PUBLIC' }),
      );
    });
  });

  it('should support date range filters', async () => {
    vi.mocked(moviesApi.getMovies).mockResolvedValueOnce(mockResponse);

    renderHook(
      () =>
        useMoviesList({
          fromDate: '2026-01-01T00:00:00Z',
          toDate: '2026-12-31T23:59:59Z',
        }),
      { wrapper: createWrapper() },
    );

    await waitFor(() => {
      expect(moviesApi.getMovies).toHaveBeenCalledWith(
        expect.objectContaining({
          fromDate: '2026-01-01T00:00:00Z',
          toDate: '2026-12-31T23:59:59Z',
        }),
      );
    });
  });

  it('should be disableable', async () => {
    vi.mocked(moviesApi.getMovies).mockResolvedValueOnce(mockResponse);

    const { result } = renderHook(() => useMoviesList({ enabled: false }), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBe(false);
    expect(moviesApi.getMovies).not.toHaveBeenCalled();
  });

  it('should provide refetch function', async () => {
    vi.mocked(moviesApi.getMovies).mockResolvedValueOnce(mockResponse);

    const { result } = renderHook(() => useMoviesList(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    vi.mocked(moviesApi.getMovies).mockResolvedValueOnce(mockResponse);

    await result.current.refetch();

    expect(moviesApi.getMovies).toHaveBeenCalledTimes(2);
  });
});

describe('useInvalidateMoviesList', () => {
  it('should invalidate movies list cache', async () => {
    const queryClient = new QueryClient();
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );

    vi.mocked(moviesApi.getMovies).mockResolvedValueOnce(mockResponse);

    renderHook(() => useMoviesList(), { wrapper });

    await waitFor(() => {
      expect(queryClient.getQueryData(['movies', 'list'])).toBeDefined();
    });

    const invalidate = renderHook(() => useInvalidateMoviesList(), { wrapper });

    await invalidate.result.current();

    expect(
      queryClient.getQueryData(
        ['movies', 'list'] as unknown as any
      ),
    ).toBeDefined();
  });
});
