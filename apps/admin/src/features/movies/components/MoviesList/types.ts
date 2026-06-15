import type { MovieStatus, MovieVisibility } from '@cinema/database';

export interface Movie {
  id: string;
  title: string;
  status: MovieStatus;
  visibility: MovieVisibility;
  posterUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MoviesListProps {
  movies: Movie[];
  isLoading?: boolean;
  onEdit: (movieId: string) => void;
  onDelete: (movieId: string) => void;
  emptyMessage?: string;
}
