export interface Column<T> {
  key: keyof T;
  label: string;
  sortable?: boolean;
  render?: (value: T[keyof T], row: T) => React.ReactNode;
  width?: string;
}

export interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  rowKey: keyof T;
  onRowClick?: (row: T) => void;
  isLoading?: boolean;
  onSort?: (key: keyof T, direction: 'asc' | 'desc') => void;
  emptyMessage?: string;
}

export type SortDirection = 'asc' | 'desc' | null;
