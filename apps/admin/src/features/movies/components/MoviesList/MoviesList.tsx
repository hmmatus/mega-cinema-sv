'use client';

import { Button, Badge, Table } from '@cinema/ui';
import type { Column } from '@cinema/ui';
import type { MoviesListProps, Movie } from './types';
import { formatDate } from '../../lib/date-utils';

const getStatusBadgeVariant = (status: string) => {
  const variants: Record<string, any> = {
    UPCOMING: 'info',
    PRERELEASE: 'warning',
    RELEASED: 'success',
    ARCHIVED: 'default',
  };
  return variants[status] || 'default';
};

const getVisibilityBadgeVariant = (visibility: string) => {
  const variants: Record<string, any> = {
    PUBLIC: 'success',
    INTERNAL: 'warning',
    HIDDEN: 'error',
  };
  return variants[visibility] || 'default';
};

export function MoviesList({
  movies,
  isLoading = false,
  onEdit,
  onDelete,
  emptyMessage = 'No hay películas',
}: MoviesListProps) {
  const columns: Column<Movie>[] = [
    {
      key: 'posterUrl',
      label: 'Póster',
      render: (value: any) =>
        value ? (
          <img
            src={value}
            alt="Poster"
            className="h-12 w-8 rounded object-cover"
          />
        ) : (
          <div className="h-12 w-8 rounded bg-gray-200" />
        ),
    },
    {
      key: 'title',
      label: 'Título',
      render: (value: string) => (
        <span className="font-medium text-gray-900">{value}</span>
      ),
    },
    {
      key: 'status',
      label: 'Estado',
      render: (value: string) => (
        <Badge variant={getStatusBadgeVariant(value)} size="sm">
          {value}
        </Badge>
      ),
    },
    {
      key: 'visibility',
      label: 'Visibilidad',
      render: (value: string) => (
        <Badge variant={getVisibilityBadgeVariant(value)} size="sm">
          {value}
        </Badge>
      ),
    },
    {
      key: 'createdAt',
      label: 'Creado',
      render: (value: string) => (
        <span className="text-sm text-gray-600">
          {formatDate(new Date(value))}
        </span>
      ),
    },
    {
      key: 'id',
      label: 'Acciones',
      render: (movieId: string) => (
        <div className="flex gap-2">
          <Button
            size="sm"
            onClick={() => onEdit(movieId)}
            className="border border-blue-300 bg-blue-50 text-blue-600 hover:bg-blue-100"
          >
            Editar
          </Button>
          <Button
            size="sm"
            onClick={() => onDelete(movieId)}
            className="border border-red-300 bg-red-50 text-red-600 hover:bg-red-100"
          >
            Eliminar
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-900">Películas</h2>
      <Table<Movie>
        columns={columns}
        data={movies}
        rowKey="id"
        isLoading={isLoading}
        emptyMessage={emptyMessage}
      />
    </div>
  );
}
