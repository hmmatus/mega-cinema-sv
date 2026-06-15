// Schemas & Types
export {
  MovieSchema,
  CreateMovieDTOSchema,
  UpdateMovieDTOSchema,
  MovieStatusEnum,
  MovieRatingEnum,
  MovieVisibilityEnum,
  GetMoviesParamsSchema,
  PaginatedMoviesResponseSchema,
} from './movies.schema';

export type {
  Movie,
  CreateMovieDTO,
  UpdateMovieDTO,
  PaginatedMoviesResponse,
  GetMoviesParams,
  MovieStatus,
  MovieRating,
  MovieVisibility,
} from './movies.schema';

// Types
export type {
  GetMoviesRequest,
  CreateMovieRequest,
  UpdateMovieRequest,
  GetMoviesResponse,
  MovieResponse,
} from './movies.types';

// Query Keys
export { moviesQueryKeys, moviesMutationKeys } from './movies.keys';

// Hooks
export { useMoviesList, useInvalidateMoviesList } from './use-movies-list';
export type { UseMoviesListOptions, UseMoviesListResult } from './use-movies-list';

export { useMovieForm } from './use-movie-form';
export type { UseMovieFormResult } from './use-movie-form';

export { useMovieDetails } from './use-movie-details';
export type { UseMovieDetailsResult, UseMovieDetailsOptions } from './use-movie-details';
