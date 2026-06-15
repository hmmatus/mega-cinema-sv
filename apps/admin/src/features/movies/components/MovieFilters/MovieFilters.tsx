'use client';

import { Input, Button, Select } from '@cinema/ui';
import type { SelectOption } from '@cinema/ui';
import { useMoviesFilterViewModel } from './MovieFilters.viewmodel';
import type { MovieFiltersProps } from './types';
import { toInputDateString, fromInputDateString } from '../../lib/date-utils';
import { useState, useCallback } from 'react';

export function MovieFilters({
  onFilterChange,
  onClear,
  statusOptions,
  visibilityOptions,
  isLoading = false,
}: MovieFiltersProps) {
  const { filters, updateFilter, clearFilters, isFilterActive } =
    useMoviesFilterViewModel(onFilterChange);

  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [selectedVisibilities, setSelectedVisibilities] = useState<string[]>([]);

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      updateFilter({ search: e.target.value || undefined });
    },
    [updateFilter]
  );

  const handleStatusChange = useCallback(
    (value: string | undefined) => {
      if (value === undefined) {
        setSelectedStatuses([]);
        updateFilter({ status: undefined });
      } else {
        const newStatuses = selectedStatuses.includes(value)
          ? selectedStatuses.filter((s) => s !== value)
          : [...selectedStatuses, value];
        setSelectedStatuses(newStatuses);
        updateFilter({ status: newStatuses });
      }
    },
    [selectedStatuses, updateFilter]
  );

  const handleVisibilityChange = useCallback(
    (value: string | undefined) => {
      if (value === undefined) {
        setSelectedVisibilities([]);
        updateFilter({ visibility: undefined });
      } else {
        const newVisibilities = selectedVisibilities.includes(value)
          ? selectedVisibilities.filter((v) => v !== value)
          : [...selectedVisibilities, value];
        setSelectedVisibilities(newVisibilities);
        updateFilter({ visibility: newVisibilities });
      }
    },
    [selectedVisibilities, updateFilter]
  );

  const handleDateFromChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const date = e.target.value ? fromInputDateString(e.target.value) : undefined;
      updateFilter({ dateFrom: date });
    },
    [updateFilter]
  );

  const handleDateToChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const date = e.target.value ? fromInputDateString(e.target.value) : undefined;
      updateFilter({ dateTo: date });
    },
    [updateFilter]
  );

  const handleClearClick = useCallback(() => {
    setSelectedStatuses([]);
    setSelectedVisibilities([]);
    clearFilters();
    onClear();
  }, [clearFilters, onClear]);

  return (
    <div className="space-y-4 rounded-lg border border-gray-200 bg-white p-4">
      <h3 className="text-sm font-semibold text-gray-900">Filtros</h3>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Search Input */}
        <div>
          <Input
            id="search-movies"
            placeholder="Buscar películas..."
            value={filters.search || ''}
            onChange={handleSearchChange}
            disabled={isLoading}
          />
        </div>

        {/* Status Select */}
        <div className="flex flex-col gap-1">
          <label htmlFor="status-filter" className="text-sm font-medium text-gray-700">
            Estado
          </label>
          <Select
            options={statusOptions}
            value={selectedStatuses[0] || undefined}
            onChange={handleStatusChange}
            placeholder="Seleccionar estado..."
            disabled={isLoading}
          />
        </div>

        {/* Visibility Select */}
        <div className="flex flex-col gap-1">
          <label htmlFor="visibility-filter" className="text-sm font-medium text-gray-700">
            Visibilidad
          </label>
          <Select
            options={visibilityOptions}
            value={selectedVisibilities[0] || undefined}
            onChange={handleVisibilityChange}
            placeholder="Seleccionar visibilidad..."
            disabled={isLoading}
          />
        </div>

        {/* Date Range */}
        <div>
          <label className="text-sm font-medium text-gray-700">
            Rango de fechas
          </label>
          <div className="flex gap-2">
            <input
              type="date"
              value={filters.dateFrom ? toInputDateString(filters.dateFrom) : ''}
              onChange={handleDateFromChange}
              disabled={isLoading}
              className="w-full rounded-md border border-gray-300 px-2 py-2 text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
            <input
              type="date"
              value={filters.dateTo ? toInputDateString(filters.dateTo) : ''}
              onChange={handleDateToChange}
              disabled={isLoading}
              className="w-full rounded-md border border-gray-300 px-2 py-2 text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
          </div>
        </div>
      </div>

      {/* Clear Button */}
      {isFilterActive && (
        <div className="flex justify-end">
          <Button
            variant="secondary"
            onClick={handleClearClick}
            disabled={isLoading}
            className="text-sm"
          >
            Limpiar filtros
          </Button>
        </div>
      )}
    </div>
  );
}
