import { z } from 'zod';

export const MovieSchema = z.object({
  id: z.string(),
  title: z.string(),
  posterUrl: z.string().nullable(),
  durationMinutes: z.number(),
  genres: z.array(z.string()),
  status: z.enum(['UPCOMING', 'PRERELEASE', 'RELEASED', 'ARCHIVED']),
  visibility: z.enum(['PUBLIC', 'PRIVATE']),
  featured: z.boolean().optional(),
  rating: z.string().nullable().optional(),
  releaseDate: z.string().nullable().optional(),
});

const PaginationSchema = z.object({
  total: z.number(),
  page: z.number(),
  pageSize: z.number(),
  totalPages: z.number(),
  hasNextPage: z.boolean(),
  hasPreviousPage: z.boolean(),
});

export const MovieListSchema = z.object({
  data: z.array(MovieSchema),
  pagination: PaginationSchema,
});

export type Movie = z.infer<typeof MovieSchema>;
