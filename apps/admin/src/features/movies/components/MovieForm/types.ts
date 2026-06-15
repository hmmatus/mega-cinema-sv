import type { MovieFormInput, Movie } from '@/src/domain/movies';

export interface MovieFormProps {
  initialData?: Partial<Movie> | MovieFormInput;
  onSubmit: (data: MovieFormInput) => Promise<void> | void;
  isLoading?: boolean;
  error?: Error | null;
  onCancel?: () => void;
}
