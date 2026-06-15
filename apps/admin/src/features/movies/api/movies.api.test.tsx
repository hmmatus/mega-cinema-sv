import { describe, it, expect, beforeEach, vi } from 'vitest';
import { apiClient } from '@/src/config/axios';
import {
  getMovies,
  getMovieById,
  createMovie,
  updateMovie,
  deleteMovie,
} from './movies.api';
import type { Movie, CreateMovieDTO } from '@/src/domain/movies/movies.schema';

// Mock axios
vi.mock('@/src/config/axios', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

const mockMovieData: Movie = {
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

describe('movies.api', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getMovies', () => {
    it('should fetch movies with default parameters', async () => {
      const mockResponse = {
        data: [mockMovieData],
        total: 1,
        limit: 10,
        offset: 0,
      };

      vi.mocked(apiClient.get).mockResolvedValueOnce({
        data: mockResponse,
      });

      const result = await getMovies();

      expect(apiClient.get).toHaveBeenCalledWith('/movies', {
        params: {
          limit: 10,
          offset: 0,
        },
      });
      expect(result).toEqual(mockResponse);
      expect(result.data).toHaveLength(1);
      expect(result.data[0].title).toBe('The Matrix');
    });

    it('should fetch movies with search filter', async () => {
      const mockResponse = {
        data: [mockMovieData],
        total: 1,
        limit: 10,
        offset: 0,
      };

      vi.mocked(apiClient.get).mockResolvedValueOnce({
        data: mockResponse,
      });

      const result = await getMovies({
        search: 'Matrix',
        limit: 10,
        offset: 0,
      });

      expect(apiClient.get).toHaveBeenCalledWith('/movies', {
        params: {
          limit: 10,
          offset: 0,
          search: 'Matrix',
        },
      });
      expect(result.data[0].title).toBe('The Matrix');
    });

    it('should fetch movies with status filter', async () => {
      const mockResponse = {
        data: [mockMovieData],
        total: 1,
        limit: 10,
        offset: 0,
      };

      vi.mocked(apiClient.get).mockResolvedValueOnce({
        data: mockResponse,
      });

      const result = await getMovies({
        status: 'RELEASED',
        limit: 10,
        offset: 0,
      });

      expect(apiClient.get).toHaveBeenCalledWith('/movies', {
        params: {
          limit: 10,
          offset: 0,
          status: 'RELEASED',
        },
      });
      expect(result.data[0].status).toBe('RELEASED');
    });

    it('should validate response with Zod schema', async () => {
      const invalidResponse = {
        data: [
          {
            id: 'not-a-uuid',
            title: 'Invalid',
            durationMinutes: -5, // Invalid
            status: 'UNKNOWN', // Invalid enum
            visibility: 'PUBLIC',
            createdAt: '2026-06-01',
            updatedAt: '2026-06-01',
          },
        ],
        total: 1,
        limit: 10,
        offset: 0,
      };

      vi.mocked(apiClient.get).mockResolvedValueOnce({
        data: invalidResponse,
      });

      await expect(getMovies()).rejects.toThrow();
    });
  });

  describe('getMovieById', () => {
    it('should fetch a single movie by ID', async () => {
      vi.mocked(apiClient.get).mockResolvedValueOnce({
        data: mockMovieData,
      });

      const result = await getMovieById(mockMovieData.id);

      expect(apiClient.get).toHaveBeenCalledWith(
        `/movies/${mockMovieData.id}`,
      );
      expect(result.id).toBe(mockMovieData.id);
      expect(result.title).toBe('The Matrix');
    });

    it('should validate movie response schema', async () => {
      const invalidMovie = {
        id: 'invalid-id',
        title: 'Test',
        durationMinutes: 'not-a-number', // Invalid
        status: 'UNKNOWN',
        visibility: 'PUBLIC',
        createdAt: '2026-06-01',
        updatedAt: '2026-06-01',
      };

      vi.mocked(apiClient.get).mockResolvedValueOnce({
        data: invalidMovie,
      });

      await expect(getMovieById('test-id')).rejects.toThrow();
    });
  });

  describe('createMovie', () => {
    it('should create a new movie', async () => {
      const createData: CreateMovieDTO = {
        title: 'New Movie',
        description: 'A new movie',
        durationMinutes: 120,
        status: 'UPCOMING',
        visibility: 'PUBLIC',
        genres: ['Action'],
        cast: ['Actor 1'],
      };

      vi.mocked(apiClient.post).mockResolvedValueOnce({
        data: { ...mockMovieData, ...createData },
      });

      const result = await createMovie(createData);

      expect(apiClient.post).toHaveBeenCalledWith('/movies', {
        title: 'New Movie',
        description: 'A new movie',
        durationMinutes: 120,
        status: 'UPCOMING',
        visibility: 'PUBLIC',
        genres: ['Action'],
        cast: ['Actor 1'],
      });
      expect(result.title).toBe('New Movie');
    });

    it('should strip empty string URLs before sending', async () => {
      const createData: CreateMovieDTO = {
        title: 'New Movie',
        durationMinutes: 120,
        status: 'UPCOMING',
        visibility: 'PUBLIC',
        posterUrl: '',
        trailerUrl: '   ',
        genres: [],
        cast: [],
      };

      vi.mocked(apiClient.post).mockResolvedValueOnce({
        data: mockMovieData,
      });

      await createMovie(createData);

      expect(apiClient.post).toHaveBeenCalledWith('/movies', {
        title: 'New Movie',
        durationMinutes: 120,
        status: 'UPCOMING',
        visibility: 'PUBLIC',
        posterUrl: undefined,
        trailerUrl: undefined,
        genres: [],
        cast: [],
      });
    });

    it('should validate created movie response', async () => {
      const createData: CreateMovieDTO = {
        title: 'New Movie',
        durationMinutes: 120,
        status: 'UPCOMING',
        visibility: 'PUBLIC',
        genres: [],
        cast: [],
      };

      const invalidResponse = {
        id: 'not-uuid',
        title: 'Test',
        durationMinutes: 'invalid',
      };

      vi.mocked(apiClient.post).mockResolvedValueOnce({
        data: invalidResponse,
      });

      await expect(createMovie(createData)).rejects.toThrow();
    });
  });

  describe('updateMovie', () => {
    it('should update an existing movie', async () => {
      const updateData = {
        title: 'Updated Title',
        featured: true,
      };

      vi.mocked(apiClient.put).mockResolvedValueOnce({
        data: { ...mockMovieData, ...updateData },
      });

      const result = await updateMovie(mockMovieData.id, updateData);

      expect(apiClient.put).toHaveBeenCalledWith(
        `/movies/${mockMovieData.id}`,
        updateData,
      );
      expect(result.title).toBe('Updated Title');
      expect(result.featured).toBe(true);
    });

    it('should strip empty string URLs on update', async () => {
      const updateData = {
        posterUrl: '',
        trailerUrl: '  ',
      };

      vi.mocked(apiClient.put).mockResolvedValueOnce({
        data: mockMovieData,
      });

      await updateMovie(mockMovieData.id, updateData);

      expect(apiClient.put).toHaveBeenCalledWith(
        `/movies/${mockMovieData.id}`,
        {
          posterUrl: undefined,
          trailerUrl: undefined,
        },
      );
    });

    it('should validate updated movie response', async () => {
      const updateData = { title: 'Updated' };

      vi.mocked(apiClient.put).mockResolvedValueOnce({
        data: { id: 'invalid-uuid', title: 'Updated' },
      });

      await expect(updateMovie(mockMovieData.id, updateData)).rejects.toThrow();
    });
  });

  describe('deleteMovie', () => {
    it('should delete a movie by ID', async () => {
      vi.mocked(apiClient.delete).mockResolvedValueOnce({});

      await deleteMovie(mockMovieData.id);

      expect(apiClient.delete).toHaveBeenCalledWith(
        `/movies/${mockMovieData.id}`,
      );
    });

    it('should handle delete errors', async () => {
      const error = new Error('Delete failed');

      vi.mocked(apiClient.delete).mockRejectedValueOnce(error);

      await expect(deleteMovie(mockMovieData.id)).rejects.toThrow(
        'Delete failed',
      );
    });
  });

  describe('schema validation', () => {
    it('should validate movie URLs properly', async () => {
      const validUrlCreate: CreateMovieDTO = {
        title: 'Test',
        durationMinutes: 120,
        status: 'UPCOMING',
        visibility: 'PUBLIC',
        posterUrl: 'https://example.com/poster.jpg',
        trailerUrl: 'https://example.com/trailer.mp4',
        genres: [],
        cast: [],
      };

      vi.mocked(apiClient.post).mockResolvedValueOnce({
        data: mockMovieData,
      });

      await expect(createMovie(validUrlCreate)).resolves.toBeDefined();
    });

    it('should reject invalid URLs', async () => {
      const invalidUrlCreate: CreateMovieDTO = {
        title: 'Test',
        durationMinutes: 120,
        status: 'UPCOMING',
        visibility: 'PUBLIC',
        posterUrl: 'not-a-url',
        genres: [],
        cast: [],
      };

      // The API call will be made, but Zod should validate on response
      vi.mocked(apiClient.post).mockResolvedValueOnce({
        data: { ...mockMovieData, posterUrl: 'not-a-url' },
      });

      await expect(createMovie(invalidUrlCreate)).rejects.toThrow();
    });
  });
});
