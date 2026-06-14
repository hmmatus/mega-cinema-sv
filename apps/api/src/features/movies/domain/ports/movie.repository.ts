import type { Movie } from '@cinema/database';

export const MOVIE_REPOSITORY = Symbol('MovieRepository');

export interface CreateMovieData {
  title: string;
  description?: string;
  durationMinutes: number;
  rating?: string;
  originalLanguage?: string;
  releaseDate?: Date;
  posterUrl?: string;
  trailerUrl?: string;
  status?: string;
}

export interface MovieRepository {
  findAll(): Promise<Movie[]>;
  findById(id: string): Promise<Movie | null>;
  create(data: CreateMovieData): Promise<Movie>;
  upsertByTitle(data: CreateMovieData): Promise<Movie>;
}
