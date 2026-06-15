'use client';

import { useTable } from './Table.viewmodel';
import type { TableProps } from './types';

export function Table<T extends Record<string, any>>({
  columns,
  data,
  rowKey,
  onRowClick,
  isLoading = false,
  onSort,
  emptyMessage = 'No hay datos',
}: TableProps<T>) {
  const { sortKey, sortDirection, handleSort } = useTable<T>({ onSort: onSort as ((key: keyof T, direction: 'asc' | 'desc') => void) | undefined });

  if (isLoading) {
    return (
      <div className="w-full">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100 border-b">
              {columns.map((col) => (
                <th key={String(col.key)} className="px-4 py-2 text-left font-semibold text-gray-900">
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 5 }).map((_, i) => (
              <tr key={i} className="border-b">
                {columns.map((col) => (
                  <td key={String(col.key)} className="px-4 py-2">
                    <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="w-full text-center py-8 text-gray-500">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-100 border-b">
            {columns.map((col) => (
              <th
                key={String(col.key)}
                className="px-4 py-2 text-left font-semibold text-gray-900 cursor-pointer hover:bg-gray-200"
                onClick={() => handleSort(col.key, col)}
                style={{ width: col.width }}
              >
                <div className="flex items-center gap-2">
                  {col.label}
                  {col.sortable && (
                    <span className="text-xs">
                      {sortKey === col.key && sortDirection === 'asc' && '▲'}
                      {sortKey === col.key && sortDirection === 'desc' && '▼'}
                    </span>
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <tr
              key={String(row[rowKey])}
              className="border-b hover:bg-gray-50 cursor-pointer"
              onClick={() => onRowClick?.(row)}
            >
              {columns.map((col) => (
                <td key={String(col.key)} className="px-4 py-2 text-gray-700">
                  {col.render ? col.render(row[col.key], row) : String(row[col.key])}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
