import type {
  Movie,
  CreateMovieDTO,
  UpdateMovieDTO,
  PaginatedMoviesResponse,
  GetMoviesParams,
  MovieStatus,
  MovieRating,
  MovieVisibility,
} from './movies.schema';

// Request types
export interface GetMoviesRequest extends GetMoviesParams {
  // Extends from schema for consistency
}

export interface CreateMovieRequest extends CreateMovieDTO {
  // Extends from schema for consistency
}

export interface UpdateMovieRequest extends UpdateMovieDTO {
  // Extends from schema for consistency
}

// Response types
export interface GetMoviesResponse extends PaginatedMoviesResponse {
  // Extends from schema for consistency
}

export interface MovieResponse extends Movie {
  // Extends from schema for consistency
}

// Domain types (re-exported for convenience)
export type { Movie, CreateMovieDTO, UpdateMovieDTO, PaginatedMoviesResponse };
export type { MovieStatus, MovieRating, MovieVisibility };
