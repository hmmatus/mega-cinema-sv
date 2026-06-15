import { describe, it, expect } from 'vitest';
import {
  MovieSchema,
  CreateMovieDTOSchema,
  UpdateMovieDTOSchema,
  MovieStatusEnum,
  MovieVisibilityEnum,
  MovieRatingEnum,
  GetMoviesParamsSchema,
  PaginatedMoviesResponseSchema,
} from './movies.schema';

describe('movies.schema', () => {
  describe('MovieStatusEnum', () => {
    it('should accept valid statuses', () => {
      const validStatuses = ['UPCOMING', 'PRERELEASE', 'RELEASED', 'ARCHIVED'];
      validStatuses.forEach((status) => {
        expect(() => MovieStatusEnum.parse(status)).not.toThrow();
      });
    });

    it('should reject invalid statuses', () => {
      expect(() => MovieStatusEnum.parse('INVALID')).toThrow();
      expect(() => MovieStatusEnum.parse('upcoming')).toThrow();
    });
  });

  describe('MovieVisibilityEnum', () => {
    it('should accept valid visibilities', () => {
      const validVisibilities = ['PUBLIC', 'INTERNAL', 'HIDDEN'];
      validVisibilities.forEach((visibility) => {
        expect(() => MovieVisibilityEnum.parse(visibility)).not.toThrow();
      });
    });

    it('should reject invalid visibilities', () => {
      expect(() => MovieVisibilityEnum.parse('PRIVATE')).toThrow();
      expect(() => MovieVisibilityEnum.parse('public')).toThrow();
    });
  });

  describe('MovieRatingEnum', () => {
    it('should accept valid ratings', () => {
      const validRatings = ['G', 'PG', 'PG13', 'R', 'NC17'];
      validRatings.forEach((rating) => {
        expect(() => MovieRatingEnum.parse(rating)).not.toThrow();
      });
    });

    it('should accept undefined', () => {
      expect(() => MovieRatingEnum.parse(undefined)).not.toThrow();
    });

    it('should reject invalid ratings', () => {
      expect(() => MovieRatingEnum.parse('X')).toThrow();
      expect(() => MovieRatingEnum.parse('pg')).toThrow();
    });
  });

  describe('MovieSchema', () => {
    const validMovie = {
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
      createdAt: new Date('2026-06-01'),
      updatedAt: new Date('2026-06-01'),
    };

    it('should validate a correct movie object', () => {
      expect(() => MovieSchema.parse(validMovie)).not.toThrow();
    });

    it('should require id as UUID', () => {
      const invalidMovie = { ...validMovie, id: 'not-a-uuid' };
      expect(() => MovieSchema.parse(invalidMovie)).toThrow();
    });

    it('should require title (non-empty)', () => {
      const invalidMovie = { ...validMovie, title: '' };
      expect(() => MovieSchema.parse(invalidMovie)).toThrow();
    });

    it('should require positive durationMinutes', () => {
      const invalidMovie = { ...validMovie, durationMinutes: -5 };
      expect(() => MovieSchema.parse(invalidMovie)).toThrow();

      const zeroMovie = { ...validMovie, durationMinutes: 0 };
      expect(() => MovieSchema.parse(zeroMovie)).toThrow();
    });

    it('should allow optional nullable fields', () => {
      const movieWithNulls = {
        ...validMovie,
        description: null,
        posterUrl: null,
        director: null,
      };
      expect(() => MovieSchema.parse(movieWithNulls)).not.toThrow();
    });

    it('should have default values for genres and cast', () => {
      const movieWithoutArrays = {
        ...validMovie,
        genres: undefined,
        cast: undefined,
      };
      const result = MovieSchema.parse(movieWithoutArrays);
      expect(result.genres).toEqual([]);
      expect(result.cast).toEqual([]);
    });

    it('should coerce date strings to Date objects', () => {
      const movieWithDates = {
        ...validMovie,
        releaseDate: '1999-03-31',
        createdAt: '2026-06-01T00:00:00Z',
        updatedAt: '2026-06-01T00:00:00Z',
      };
      const result = MovieSchema.parse(movieWithDates);
      expect(result.releaseDate).toBeInstanceOf(Date);
      expect(result.createdAt).toBeInstanceOf(Date);
      expect(result.updatedAt).toBeInstanceOf(Date);
    });
  });

  describe('CreateMovieDTOSchema', () => {
    const validCreateData = {
      title: 'New Movie',
      description: 'A new movie',
      durationMinutes: 120,
      status: 'UPCOMING',
      visibility: 'PUBLIC',
      genres: ['Action'],
      cast: ['Actor 1'],
    };

    it('should validate correct create data', () => {
      expect(() => CreateMovieDTOSchema.parse(validCreateData)).not.toThrow();
    });

    it('should require title', () => {
      const invalid = { ...validCreateData, title: '' };
      expect(() => CreateMovieDTOSchema.parse(invalid)).toThrow();
    });

    it('should require positive durationMinutes', () => {
      const invalid = { ...validCreateData, durationMinutes: -1 };
      expect(() => CreateMovieDTOSchema.parse(invalid)).toThrow();
    });

    it('should require status', () => {
      const invalid = { ...validCreateData, status: undefined };
      expect(() => CreateMovieDTOSchema.parse(invalid)).toThrow();
    });

    it('should require visibility', () => {
      const invalid = { ...validCreateData, visibility: undefined };
      expect(() => CreateMovieDTOSchema.parse(invalid)).toThrow();
    });

    it('should allow optional fields', () => {
      const minimal = {
        title: 'Movie',
        durationMinutes: 120,
        status: 'UPCOMING',
        visibility: 'PUBLIC',
      };
      expect(() => CreateMovieDTOSchema.parse(minimal)).not.toThrow();
    });

    it('should validate URLs if provided', () => {
      const invalidUrl = {
        ...validCreateData,
        posterUrl: 'not-a-url',
      };
      expect(() => CreateMovieDTOSchema.parse(invalidUrl)).toThrow();
    });

    it('should allow empty string for URLs', () => {
      const emptyUrlData = {
        ...validCreateData,
        posterUrl: '',
        trailerUrl: '',
      };
      expect(() => CreateMovieDTOSchema.parse(emptyUrlData)).not.toThrow();
    });

    it('should have default values for genres and cast', () => {
      const minimal = {
        title: 'Movie',
        durationMinutes: 120,
        status: 'UPCOMING',
        visibility: 'PUBLIC',
      };
      const result = CreateMovieDTOSchema.parse(minimal);
      expect(result.genres).toEqual([]);
      expect(result.cast).toEqual([]);
    });

    it('should default featured to false', () => {
      const data = {
        title: 'Movie',
        durationMinutes: 120,
        status: 'UPCOMING',
        visibility: 'PUBLIC',
      };
      const result = CreateMovieDTOSchema.parse(data);
      expect(result.featured).toBe(false);
    });
  });

  describe('UpdateMovieDTOSchema', () => {
    it('should allow all fields to be optional', () => {
      expect(() => UpdateMovieDTOSchema.parse({})).not.toThrow();
      expect(() => UpdateMovieDTOSchema.parse({ title: 'Updated' })).not
        .toThrow();
      expect(() => UpdateMovieDTOSchema.parse({ featured: true })).not.toThrow();
    });

    it('should validate fields that are provided', () => {
      const invalid = {
        durationMinutes: -5,
      };
      expect(() => UpdateMovieDTOSchema.parse(invalid)).toThrow();
    });

    it('should validate URLs if provided', () => {
      const invalidUrl = {
        posterUrl: 'invalid-url',
      };
      expect(() => UpdateMovieDTOSchema.parse(invalidUrl)).toThrow();
    });

    it('should accept empty strings for URLs', () => {
      expect(() =>
        UpdateMovieDTOSchema.parse({ posterUrl: '' }),
      ).not.toThrow();
    });
  });

  describe('GetMoviesParamsSchema', () => {
    it('should have default limit of 10 and offset of 0', () => {
      const result = GetMoviesParamsSchema.parse({});
      expect(result.limit).toBe(10);
      expect(result.offset).toBe(0);
    });

    it('should accept custom limit and offset', () => {
      const result = GetMoviesParamsSchema.parse({
        limit: 25,
        offset: 50,
      });
      expect(result.limit).toBe(25);
      expect(result.offset).toBe(50);
    });

    it('should validate limit must be positive', () => {
      expect(() =>
        GetMoviesParamsSchema.parse({ limit: 0 }),
      ).toThrow();
      expect(() =>
        GetMoviesParamsSchema.parse({ limit: -1 }),
      ).toThrow();
    });

    it('should validate offset must be non-negative', () => {
      expect(() =>
        GetMoviesParamsSchema.parse({ offset: -1 }),
      ).toThrow();
      expect(() => GetMoviesParamsSchema.parse({ offset: 0 })).not.toThrow();
    });

    it('should accept search string', () => {
      const result = GetMoviesParamsSchema.parse({ search: 'Matrix' });
      expect(result.search).toBe('Matrix');
    });

    it('should accept status filter', () => {
      const result = GetMoviesParamsSchema.parse({ status: 'RELEASED' });
      expect(result.status).toBe('RELEASED');
    });

    it('should accept visibility filter', () => {
      const result = GetMoviesParamsSchema.parse({ visibility: 'PUBLIC' });
      expect(result.visibility).toBe('PUBLIC');
    });

    it('should accept date range filters', () => {
      const fromDate = '2026-01-01T00:00:00Z';
      const toDate = '2026-12-31T23:59:59Z';
      const result = GetMoviesParamsSchema.parse({
        fromDate,
        toDate,
      });
      expect(result.fromDate).toBe(fromDate);
      expect(result.toDate).toBe(toDate);
    });

    it('should accept multiple filters together', () => {
      const result = GetMoviesParamsSchema.parse({
        limit: 20,
        offset: 40,
        search: 'Matrix',
        status: 'RELEASED',
        visibility: 'PUBLIC',
        fromDate: '2026-01-01T00:00:00Z',
      });
      expect(result.limit).toBe(20);
      expect(result.offset).toBe(40);
      expect(result.search).toBe('Matrix');
      expect(result.status).toBe('RELEASED');
      expect(result.visibility).toBe('PUBLIC');
      expect(result.fromDate).toBe('2026-01-01T00:00:00Z');
    });
  });

  describe('PaginatedMoviesResponseSchema', () => {
    const validResponse = {
      data: [
        {
          id: '550e8400-e29b-41d4-a716-446655440000',
          title: 'The Matrix',
          durationMinutes: 136,
          status: 'RELEASED',
          visibility: 'PUBLIC',
          createdAt: new Date('2026-06-01'),
          updatedAt: new Date('2026-06-01'),
        },
      ],
      total: 1,
      limit: 10,
      offset: 0,
    };

    it('should validate correct paginated response', () => {
      expect(() => PaginatedMoviesResponseSchema.parse(validResponse))
        .not.toThrow();
    });

    it('should require data array', () => {
      const invalid = { ...validResponse, data: undefined };
      expect(() => PaginatedMoviesResponseSchema.parse(invalid)).toThrow();
    });

    it('should require total count', () => {
      const invalid = { ...validResponse, total: undefined };
      expect(() => PaginatedMoviesResponseSchema.parse(invalid)).toThrow();
    });

    it('should validate total is non-negative', () => {
      const invalid = { ...validResponse, total: -1 };
      expect(() => PaginatedMoviesResponseSchema.parse(invalid)).toThrow();
    });

    it('should require limit', () => {
      const invalid = { ...validResponse, limit: undefined };
      expect(() => PaginatedMoviesResponseSchema.parse(invalid)).toThrow();
    });

    it('should validate limit is positive', () => {
      const invalid = { ...validResponse, limit: 0 };
      expect(() => PaginatedMoviesResponseSchema.parse(invalid)).toThrow();
    });

    it('should require offset', () => {
      const invalid = { ...validResponse, offset: undefined };
      expect(() => PaginatedMoviesResponseSchema.parse(invalid)).toThrow();
    });

    it('should validate offset is non-negative', () => {
      const invalid = { ...validResponse, offset: -1 };
      expect(() => PaginatedMoviesResponseSchema.parse(invalid)).toThrow();
    });

    it('should allow empty data array', () => {
      const emptyResponse = {
        data: [],
        total: 0,
        limit: 10,
        offset: 0,
      };
      expect(() => PaginatedMoviesResponseSchema.parse(emptyResponse))
        .not.toThrow();
    });
  });
});
