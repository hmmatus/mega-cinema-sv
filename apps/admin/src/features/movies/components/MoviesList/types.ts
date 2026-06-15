import type { Movie } from '@/src/domain/movies';

export interface MoviesListProps {
  movies: Movie[];
  isLoading?: boolean;
  onEdit: (movieId: string) => void;
  onDelete: (movieId: string) => void;
  emptyMessage?: string;
}
