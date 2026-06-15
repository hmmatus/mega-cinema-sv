import { useCallback, useState } from 'react';
import type { MoviesFilter } from './types';

export interface UseMoviesFilterViewModelReturn {
  filters: MoviesFilter;
  updateFilter: (partial: Partial<MoviesFilter>) => void;
  clearFilters: () => void;
  isFilterActive: boolean;
}

export function useMoviesFilterViewModel(
  onFilterChange: (filters: MoviesFilter) => void
): UseMoviesFilterViewModelReturn {
  const [filters, setFilters] = useState<MoviesFilter>({});

  const updateFilter = useCallback(
    (partial: Partial<MoviesFilter>) => {
      const newFilters = { ...filters, ...partial };
      setFilters(newFilters);
      onFilterChange(newFilters);
    },
    [filters, onFilterChange]
  );

  const clearFilters = useCallback(() => {
    const emptyFilters: MoviesFilter = {};
    setFilters(emptyFilters);
    onFilterChange(emptyFilters);
  }, [onFilterChange]);

  const isFilterActive =
    Boolean(filters.search) ||
    (filters.status && filters.status.length > 0) ||
    (filters.visibility && filters.visibility.length > 0) ||
    Boolean(filters.dateFrom) ||
    Boolean(filters.dateTo);

  return {
    filters,
    updateFilter,
    clearFilters,
    isFilterActive,
  };
}
