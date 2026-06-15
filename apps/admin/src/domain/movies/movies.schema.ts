import { z } from 'zod';

// Enums (matching Prisma schema)
export const MovieStatusEnum = z.enum([
  'UPCOMING',
  'PRERELEASE',
  'RELEASED',
  'ARCHIVED',
]);

export const MovieRatingEnum = z.enum(['G', 'PG', 'PG13', 'R', 'NC17']).optional();

export const MovieVisibilityEnum = z.enum(['PUBLIC', 'INTERNAL', 'HIDDEN']);

// Base Movie schema (response from API)
export const MovieSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional().nullable(),
  durationMinutes: z.number().positive('Duration must be greater than 0'),
  rating: MovieRatingEnum,
  originalLanguage: z.string().optional().nullable(),
  status: MovieStatusEnum,
  releaseDate: z.coerce.date().optional().nullable(),
  posterUrl: z.string().url().optional().nullable(),
  trailerUrl: z.string().url().optional().nullable(),
  director: z.string().optional().nullable(),
  genres: z.array(z.string()).default([]),
  cast: z.array(z.string()).default([]),
  featured: z.boolean().default(false),
  visibility: MovieVisibilityEnum,
  metadata: z.record(z.string(), z.any()).optional().nullable(),
  createdById: z.string().uuid().optional().nullable(),
  updatedById: z.string().uuid().optional().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

// Create Movie DTO (request to API)
export const CreateMovieDTOSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  durationMinutes: z.number().positive('Duration must be greater than 0'),
  rating: MovieRatingEnum,
  originalLanguage: z.string().optional(),
  status: MovieStatusEnum,
  releaseDate: z.coerce.date().optional(),
  posterUrl: z.string().url('Invalid poster URL').optional().or(z.literal('')),
  trailerUrl: z.string().url('Invalid trailer URL').optional().or(z.literal('')),
  director: z.string().optional(),
  genres: z.array(z.string()).default([]),
  cast: z.array(z.string()).default([]),
  featured: z.boolean().default(false),
  visibility: MovieVisibilityEnum,
});

// Update Movie DTO (request to API)
export const UpdateMovieDTOSchema = CreateMovieDTOSchema.partial();

// Paginated response schema
export const PaginatedMoviesResponseSchema = z.object({
  data: z.array(MovieSchema),
  total: z.number().min(0),
  limit: z.number().positive(),
  offset: z.number().min(0),
});

// Get movies request parameters
export const GetMoviesParamsSchema = z.object({
  limit: z.number().positive().default(10),
  offset: z.number().min(0).default(0),
  search: z.string().optional(),
  status: MovieStatusEnum.optional(),
  visibility: MovieVisibilityEnum.optional(),
  fromDate: z.string().datetime().optional(),
  toDate: z.string().datetime().optional(),
});

// Type exports
export type Movie = z.infer<typeof MovieSchema>;
export type CreateMovieDTO = z.infer<typeof CreateMovieDTOSchema>;
export type UpdateMovieDTO = z.infer<typeof UpdateMovieDTOSchema>;
export type PaginatedMoviesResponse = z.infer<typeof PaginatedMoviesResponseSchema>;
export type GetMoviesParams = z.infer<typeof GetMoviesParamsSchema>;
export type MovieStatus = z.infer<typeof MovieStatusEnum>;
export type MovieRating = z.infer<typeof MovieRatingEnum>;
export type MovieVisibility = z.infer<typeof MovieVisibilityEnum>;
