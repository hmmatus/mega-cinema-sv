import type { Movie } from '@/src/domain/movies';

export interface MovieDetailsProps {
  movieId: string;
  movie?: Movie;
  isLoading?: boolean;
  error?: string;
  onEdit?: (id: string) => void;
  onBack?: () => void;
}
