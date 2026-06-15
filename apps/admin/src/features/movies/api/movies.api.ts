import { apiClient } from '@/src/config/axios';
import {
  MovieSchema,
  PaginatedMoviesResponseSchema,
  GetMoviesParamsSchema,
  type Movie,
  type CreateMovieDTO,
  type UpdateMovieDTO,
  type PaginatedMoviesResponse,
  type GetMoviesParams,
} from '@/src/domain/movies/movies.schema';

/**
 * Get paginated list of movies with optional filters
 */
export async function getMovies(
  params: Partial<GetMoviesParams> = {},
): Promise<PaginatedMoviesResponse> {
  // Merge with defaults from schema
  const validatedParams = GetMoviesParamsSchema.parse(params);

  const res = await apiClient.get<PaginatedMoviesResponse>('/movies', {
    params: validatedParams,
  });

  // Validate response structure
  const validated = PaginatedMoviesResponseSchema.parse(res.data);
  return validated;
}

/**
 * Get a single movie by ID
 */
export async function getMovieById(id: string): Promise<Movie> {
  const res = await apiClient.get<Movie>(`/movies/${id}`);

  // Validate response structure
  const validated = MovieSchema.parse(res.data);
  return validated;
}

/**
 * Create a new movie
 */
export async function createMovie(data: CreateMovieDTO): Promise<Movie> {
  // Clean empty string URLs before sending
  const payload = {
    ...data,
    posterUrl: data.posterUrl && data.posterUrl.trim() ? data.posterUrl : undefined,
    trailerUrl: data.trailerUrl && data.trailerUrl.trim() ? data.trailerUrl : undefined,
  };

  const res = await apiClient.post<Movie>('/movies', payload);

  // Validate response structure
  const validated = MovieSchema.parse(res.data);
  return validated;
}

/**
 * Update an existing movie (partial update supported)
 */
export async function updateMovie(
  id: string,
  data: UpdateMovieDTO,
): Promise<Movie> {
  // Clean empty string URLs before sending
  const payload = {
    ...data,
    posterUrl:
      data.posterUrl !== undefined && data.posterUrl && data.posterUrl.trim()
        ? data.posterUrl
        : undefined,
    trailerUrl:
      data.trailerUrl !== undefined && data.trailerUrl && data.trailerUrl.trim()
        ? data.trailerUrl
        : undefined,
  };

  const res = await apiClient.put<Movie>(`/movies/${id}`, payload);

  // Validate response structure
  const validated = MovieSchema.parse(res.data);
  return validated;
}

/**
 * Delete a movie by ID
 * Returns 204 No Content on success
 */
export async function deleteMovie(id: string): Promise<void> {
  await apiClient.delete(`/movies/${id}`);
}
