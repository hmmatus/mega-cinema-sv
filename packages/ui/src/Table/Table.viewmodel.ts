'use client';

import { useState, useCallback } from 'react';
import type { Column, SortDirection } from './types';

export function useTable<T>({
  onSort,
}: {
  onSort?: (key: keyof T, direction: 'asc' | 'desc') => void;
}) {
  const [sortKey, setSortKey] = useState<keyof T | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);

  const handleSort = useCallback(
    (key: keyof T, column: Column<T>) => {
      if (!column.sortable) return;

      let newDirection: SortDirection = 'asc';
      if (sortKey === key && sortDirection === 'asc') {
        newDirection = 'desc';
      } else if (sortKey === key && sortDirection === 'desc') {
        newDirection = null;
      }

      setSortKey(newDirection ? key : null);
      setSortDirection(newDirection);

      if (onSort && newDirection) {
        onSort(key, newDirection);
      }
    },
    [sortKey, sortDirection, onSort]
  );

  return {
    sortKey,
    sortDirection,
    handleSort,
  };
}
