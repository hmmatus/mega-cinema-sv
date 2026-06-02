import type { Movie, MovieStatus, MovieVisibility, MovieRating } from '@cinema/database';

export const MOVIE_REPOSITORY = Symbol('MovieRepository');

export interface MovieFilters {
  status?: MovieStatus;
  visibility?: MovieVisibility;
  featured?: boolean;
  genre?: string;
  rating?: MovieRating;
  search?: string;
}

export interface MoviePagination {
  page: number;
  pageSize: number;
  sortBy: 'releaseDate' | 'createdAt' | 'updatedAt' | 'featured';
  sortOrder: 'asc' | 'desc';
}

export interface MovieWithShowtimes extends Movie {
  upcomingShowtimes: ShowtimeBasic[];
}

export interface ShowtimeBasic {
  id: string;
  startAt: Date;
  branchId: string;
  branchName: string;
  roomName: string;
  availableSeats: number;
  basePrice: number;
}

export interface PaginatedMovies {
  data: Movie[];
  pagination: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

export interface CreateMovieData {
  title: string;
  description?: string | null;
  durationMinutes: number;
  rating?: MovieRating | null;
  originalLanguage?: string | null;
  status?: MovieStatus;
  releaseDate?: Date | null;
  posterUrl?: string | null;
  trailerUrl?: string | null;
  director?: string | null;
  genres?: string[];
  cast?: string[];
  featured?: boolean;
  visibility?: MovieVisibility;
  metadata?: object | null;
  createdById?: string | null;
}

export interface UpdateMovieData {
  title?: string;
  description?: string | null;
  durationMinutes?: number;
  rating?: MovieRating | null;
  originalLanguage?: string | null;
  status?: MovieStatus;
  releaseDate?: Date | null;
  posterUrl?: string | null;
  trailerUrl?: string | null;
  director?: string | null;
  genres?: string[];
  cast?: string[];
  featured?: boolean;
  visibility?: MovieVisibility;
  metadata?: object | null;
  updatedById?: string | null;
}

export interface MovieRepository {
  findMany(filters: MovieFilters, pagination: MoviePagination): Promise<PaginatedMovies>;
  findById(id: string): Promise<Movie | null>;
  findByIdWithShowtimes(id: string): Promise<MovieWithShowtimes | null>;
  findFeatured(limit: number): Promise<MovieWithShowtimes[]>;
  findByStatus(statuses: MovieStatus[], limit: number): Promise<MovieWithShowtimes[]>;
  create(data: CreateMovieData): Promise<Movie>;
  update(id: string, data: UpdateMovieData): Promise<Movie>;
  findFutureShowtimeIds(movieId: string): Promise<string[]>;
}
