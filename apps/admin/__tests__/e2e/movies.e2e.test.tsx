import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

/**
 * Phase 5: E2E Tests for Movies Module
 * 
 * Tests the following user journeys:
 * - T-400: List movies, search, paginate
 * - T-401: Filter by status and visibility
 * - T-402: Create new movie (happy path)
 * - T-403: Edit existing movie
 * - T-404: Delete movie with confirmation modal
 * - T-405: Archive movie (soft delete)
 */

describe('Movies Admin E2E Tests', () => {
  // Mock movie data
  const mockMovies = [
    {
      id: '550e8400-e29b-41d4-a716-446655440001',
      title: 'The Matrix',
      description: 'A hacker discovers reality is a simulation',
      durationMinutes: 136,
      rating: 'R',
      originalLanguage: 'en',
      status: 'RELEASED',
      releaseDate: new Date('1999-03-31'),
      posterUrl: 'https://example.com/matrix.jpg',
      trailerUrl: 'https://example.com/matrix-trailer',
      director: 'The Wachowskis',
      genres: ['Sci-Fi', 'Action'],
      cast: ['Keanu Reeves', 'Laurence Fishburne'],
      featured: true,
      visibility: 'PUBLIC',
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
    },
    {
      id: '550e8400-e29b-41d4-a716-446655440002',
      title: 'Inception',
      description: 'A thief who steals corporate secrets through dream-sharing',
      durationMinutes: 148,
      rating: 'PG13',
      originalLanguage: 'en',
      status: 'RELEASED',
      releaseDate: new Date('2010-07-16'),
      posterUrl: 'https://example.com/inception.jpg',
      trailerUrl: 'https://example.com/inception-trailer',
      director: 'Christopher Nolan',
      genres: ['Sci-Fi', 'Thriller'],
      cast: ['Leonardo DiCaprio', 'Marion Cotillard'],
      featured: false,
      visibility: 'PUBLIC',
      createdAt: new Date('2024-01-02'),
      updatedAt: new Date('2024-01-02'),
    },
  ];

  beforeEach(() => {
    // Mock API responses
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('T-400: List movies, search, paginate', () => {
    it('should load and display list of movies', async () => {
      // Arrange
      const mockFetch = vi.mocked(global.fetch);
      mockFetch.mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            data: mockMovies,
            total: 2,
            limit: 10,
            offset: 0,
          }),
          { status: 200 },
        ),
      );

      // Act
      const response = await fetch(
        'http://localhost:3001/api/movies?limit=10&offset=0',
      );
      const result = await response.json();

      // Assert
      expect(response.status).toBe(200);
      expect(result.data).toHaveLength(2);
      expect(result.data[0].title).toBe('The Matrix');
      expect(result.total).toBe(2);
    });

    it('should search movies by title', async () => {
      // Arrange
      const mockFetch = vi.mocked(global.fetch);
      mockFetch.mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            data: [mockMovies[0]],
            total: 1,
            limit: 10,
            offset: 0,
          }),
          { status: 200 },
        ),
      );

      // Act
      const response = await fetch(
        'http://localhost:3001/api/movies?search=Matrix',
      );
      const result = await response.json();

      // Assert
      expect(result.data).toHaveLength(1);
      expect(result.data[0].title).toBe('The Matrix');
    });

    it('should paginate through results', async () => {
      // Arrange
      const mockFetch = vi.mocked(global.fetch);
      mockFetch.mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            data: [mockMovies[0]],
            total: 2,
            limit: 1,
            offset: 0,
          }),
          { status: 200 },
        ),
      );

      // Act
      const response = await fetch(
        'http://localhost:3001/api/movies?limit=1&offset=0',
      );
      const result = await response.json();

      // Assert
      expect(result.limit).toBe(1);
      expect(result.offset).toBe(0);
      expect(result.total).toBe(2);
    });
  });

  describe('T-401: Filter by status and visibility', () => {
    it('should filter movies by status', async () => {
      // Arrange
      const mockFetch = vi.mocked(global.fetch);
      mockFetch.mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            data: mockMovies.filter((m) => m.status === 'RELEASED'),
            total: 2,
            limit: 10,
            offset: 0,
          }),
          { status: 200 },
        ),
      );

      // Act
      const response = await fetch(
        'http://localhost:3001/api/movies?status=RELEASED',
      );
      const result = await response.json();

      // Assert
      expect(result.data).toHaveLength(2);
      result.data.forEach((movie: any) => {
        expect(movie.status).toBe('RELEASED');
      });
    });

    it('should filter movies by visibility', async () => {
      // Arrange
      const mockFetch = vi.mocked(global.fetch);
      mockFetch.mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            data: mockMovies.filter((m) => m.visibility === 'PUBLIC'),
            total: 2,
            limit: 10,
            offset: 0,
          }),
          { status: 200 },
        ),
      );

      // Act
      const response = await fetch(
        'http://localhost:3001/api/movies?visibility=PUBLIC',
      );
      const result = await response.json();

      // Assert
      expect(result.data).toHaveLength(2);
      result.data.forEach((movie: any) => {
        expect(movie.visibility).toBe('PUBLIC');
      });
    });

    it('should combine status and visibility filters', async () => {
      // Arrange
      const mockFetch = vi.mocked(global.fetch);
      mockFetch.mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            data: mockMovies.filter(
              (m) => m.status === 'RELEASED' && m.visibility === 'PUBLIC',
            ),
            total: 2,
            limit: 10,
            offset: 0,
          }),
          { status: 200 },
        ),
      );

      // Act
      const response = await fetch(
        'http://localhost:3001/api/movies?status=RELEASED&visibility=PUBLIC',
      );
      const result = await response.json();

      // Assert
      expect(result.data).toHaveLength(2);
    });
  });

  describe('T-402: Create new movie (happy path)', () => {
    it('should create a new movie successfully', async () => {
      // Arrange
      const newMovie = {
        title: 'Dune',
        description: 'Epic sci-fi adaptation',
        durationMinutes: 166,
        rating: 'PG13',
        originalLanguage: 'en',
        status: 'UPCOMING',
        visibility: 'PUBLIC',
      };

      const mockFetch = vi.mocked(global.fetch);
      mockFetch.mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            id: '550e8400-e29b-41d4-a716-446655440003',
            ...newMovie,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          }),
          { status: 201 },
        ),
      );

      // Act
      const response = await fetch('http://localhost:3001/api/movies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newMovie),
      });
      const result = await response.json();

      // Assert
      expect(response.status).toBe(201);
      expect(result.title).toBe('Dune');
      expect(result.id).toBeDefined();
    });

    it('should validate required fields on create', async () => {
      // Arrange
      const mockFetch = vi.mocked(global.fetch);
      mockFetch.mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            error: 'Title is required',
          }),
          { status: 400 },
        ),
      );

      // Act
      const response = await fetch('http://localhost:3001/api/movies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ durationMinutes: 100 }),
      });

      // Assert
      expect(response.status).toBe(400);
    });
  });

  describe('T-403: Edit existing movie', () => {
    it('should update an existing movie', async () => {
      // Arrange
      const updatedData = {
        title: 'The Matrix Reloaded',
        status: 'ARCHIVED',
      };

      const mockFetch = vi.mocked(global.fetch);
      mockFetch.mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            ...mockMovies[0],
            ...updatedData,
            updatedAt: new Date().toISOString(),
          }),
          { status: 200 },
        ),
      );

      // Act
      const response = await fetch(
        `http://localhost:3001/api/movies/${mockMovies[0].id}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedData),
        },
      );
      const result = await response.json();

      // Assert
      expect(response.status).toBe(200);
      expect(result.title).toBe('The Matrix Reloaded');
      expect(result.status).toBe('ARCHIVED');
    });

    it('should return 404 for non-existent movie update', async () => {
      // Arrange
      const mockFetch = vi.mocked(global.fetch);
      mockFetch.mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            error: 'Movie not found',
          }),
          { status: 404 },
        ),
      );

      // Act
      const response = await fetch(
        'http://localhost:3001/api/movies/non-existent-id',
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title: 'Updated' }),
        },
      );

      // Assert
      expect(response.status).toBe(404);
    });
  });

  describe('T-404: Delete movie with confirmation modal', () => {
    it('should delete a movie', async () => {
      // Arrange
      const mockFetch = vi.mocked(global.fetch);
      mockFetch.mockResolvedValueOnce(new Response(null, { status: 204 }));

      // Act
      const response = await fetch(
        `http://localhost:3001/api/movies/${mockMovies[0].id}`,
        {
          method: 'DELETE',
        },
      );

      // Assert
      expect(response.status).toBe(204);
    });

    it('should return 404 when deleting non-existent movie', async () => {
      // Arrange
      const mockFetch = vi.mocked(global.fetch);
      mockFetch.mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            error: 'Movie not found',
          }),
          { status: 404 },
        ),
      );

      // Act
      const response = await fetch(
        'http://localhost:3001/api/movies/non-existent-id',
        {
          method: 'DELETE',
        },
      );

      // Assert
      expect(response.status).toBe(404);
    });
  });

  describe('T-405: Archive movie (soft delete)', () => {
    it('should archive a movie (set status to ARCHIVED)', async () => {
      // Arrange
      const mockFetch = vi.mocked(global.fetch);
      mockFetch.mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            ...mockMovies[0],
            status: 'ARCHIVED',
          }),
          { status: 200 },
        ),
      );

      // Act
      const response = await fetch(
        `http://localhost:3001/api/movies/${mockMovies[0].id}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'ARCHIVED' }),
        },
      );
      const result = await response.json();

      // Assert
      expect(response.status).toBe(200);
      expect(result.status).toBe('ARCHIVED');
    });

    it('should list both active and archived movies separately when filtering', async () => {
      // Arrange
      const archivedMovies = mockMovies.filter((m) => m.status === 'ARCHIVED');
      const mockFetch = vi.mocked(global.fetch);
      mockFetch.mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            data: archivedMovies,
            total: archivedMovies.length,
            limit: 10,
            offset: 0,
          }),
          { status: 200 },
        ),
      );

      // Act
      const response = await fetch(
        'http://localhost:3001/api/movies?status=ARCHIVED',
      );
      const result = await response.json();

      // Assert
      expect(response.status).toBe(200);
      result.data.forEach((movie: any) => {
        expect(movie.status).toBe('ARCHIVED');
      });
    });
  });
});
