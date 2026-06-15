import { describe, it, expect, vi, beforeAll } from 'vitest';
import { fetchMovies, fetchCurrentShowings } from '../movies.api';

process.env.NEXT_PUBLIC_API_URL = 'http://localhost:3001/api';

const VALID_MOVIE = {
  id: '1',
  title: 'Test Movie',
  posterUrl: null,
  durationMinutes: 120,
  genres: ['Acción'],
  status: 'RELEASED',
  visibility: 'PUBLIC',
};

const PAGINATED_RESPONSE = {
  data: [VALID_MOVIE],
  pagination: { total: 1, page: 0, pageSize: 20, totalPages: 1, hasNextPage: false, hasPreviousPage: false },
};

describe('fetchMovies', () => {
  it('returns parsed movies on success', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => PAGINATED_RESPONSE,
    } as Response);

    const movies = await fetchMovies({ status: 'RELEASED', pageSize: 20 });
    expect(movies).toHaveLength(1);
    expect(movies[0].title).toBe('Test Movie');
  });

  it('throws on non-ok response', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      json: async () => ({}),
    } as Response);

    await expect(fetchMovies()).rejects.toThrow('movies fetch failed: 500');
  });

  it('throws when response shape is invalid', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ wrong: 'shape' }),
    } as Response);

    await expect(fetchMovies()).rejects.toThrow();
  });
});

describe('fetchCurrentShowings', () => {
  it('returns parsed movies array on success', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => [VALID_MOVIE],
    } as Response);

    const movies = await fetchCurrentShowings(20);
    expect(movies).toHaveLength(1);
  });

  it('throws on non-ok response', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 404,
      json: async () => ({}),
    } as Response);

    await expect(fetchCurrentShowings()).rejects.toThrow('current-showings fetch failed: 404');
  });
});
