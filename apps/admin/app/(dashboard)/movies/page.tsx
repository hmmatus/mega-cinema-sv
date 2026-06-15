'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@cinema/ui';
import { MoviesList } from '@/src/features/movies/components/MoviesList';
import { MovieFilters } from '@/src/features/movies/components/MovieFilters';
import { useMoviesList } from '@/src/domain/movies/use-movies-list';
import type { GetMoviesParams } from '@/src/domain/movies';

export default function MoviesPage() {
  const router = useRouter();
  const [params, setParams] = useState<Partial<GetMoviesParams>>({
    limit: 10,
    offset: 0,
  });

  const { movies, isLoading, error, total, limit, offset } = useMoviesList(params);

  const handleEdit = (id: string) => {
    router.push(`/dashboard/movies/${id}/edit`);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this movie?')) {
      // TODO: Implement delete functionality
      console.log('Delete movie:', id);
    }
  };

  const handleFilterChange = (filters: any) => {
    setParams((prev) => ({
      ...prev,
      ...filters,
      offset: 0,
    }));
  };

  const handleReset = () => {
    setParams({
      limit: 10,
      offset: 0,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Películas</h1>
        <Button onClick={() => router.push('/dashboard/movies/new')}>
          + Crear película
        </Button>
      </div>

      <MovieFilters
        onFilterChange={handleFilterChange}
        onClear={handleReset}
        statusOptions={[
          { label: 'Active', value: 'active' },
          { label: 'Inactive', value: 'inactive' },
        ]}
        visibilityOptions={[
          { label: 'Public', value: 'public' },
          { label: 'Private', value: 'private' },
        ]}
        isLoading={isLoading}
      />

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <p className="text-red-800">{error instanceof Error ? error.message : String(error)}</p>
        </div>
      )}

      <MoviesList
        movies={movies}
        isLoading={isLoading}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      {total > 0 && (
        <div className="flex items-center justify-between text-sm text-gray-600">
          <p>
            Showing {((offset ?? 0) as number) + 1} to{' '}
            {Math.min(((offset ?? 0) as number) + ((limit ?? 10) as number), total)} of{' '}
            {total} movies
          </p>
          <div className="flex gap-2">
            <Button
              disabled={((offset ?? 0) as number) === 0 || isLoading}
              onClick={() =>
                setParams((prev) => ({
                  ...prev,
                  offset: Math.max(0, ((prev.offset ?? 0) as number) - ((prev.limit ?? 10) as number)),
                }))
              }
              className="border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
            >
              Previous
            </Button>
            <Button
              disabled={
                ((offset ?? 0) as number) + ((limit ?? 10) as number) >= total || isLoading
              }
              onClick={() =>
                setParams((prev) => ({
                  ...prev,
                  offset: ((prev.offset ?? 0) as number) + ((prev.limit ?? 10) as number),
                }))
              }
              className="border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
