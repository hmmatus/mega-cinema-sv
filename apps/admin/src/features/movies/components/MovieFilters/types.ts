import type { SelectOption } from '@cinema/ui';

export interface MoviesFilter {
  search?: string;
  status?: string[];
  visibility?: string[];
  dateFrom?: Date;
  dateTo?: Date;
}

export interface MovieFiltersProps {
  onFilterChange: (filters: MoviesFilter) => void;
  onClear: () => void;
  statusOptions: SelectOption[];
  visibilityOptions: SelectOption[];
  isLoading?: boolean;
}
