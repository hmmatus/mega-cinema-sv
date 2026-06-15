import type { MovieFormInput } from '@/src/domain/movies';

export interface MovieFormProps {
  initialData?: MovieFormInput & { id?: string };
  onSubmit: (data: MovieFormInput) => Promise<void> | void;
  isLoading?: boolean;
  error?: Error | null;
  onCancel?: () => void;
}
