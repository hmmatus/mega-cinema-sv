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

  const { movies, isLoading, error, totalCount } = useMoviesList(params);

  const handleEdit = (id: string) => {
    router.push(`/dashboard/movies/${id}/edit`);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this movie?')) {
      // TODO: Implement delete functionality
      console.log('Delete movie:', id);
    }
  };

  const handleSearch = (query: string) => {
    setParams((prev) => ({
      ...prev,
      search: query || undefined,
      offset: 0,
    }));
  };

  const handleStatusChange = (status: string | undefined) => {
    setParams((prev) => ({
      ...prev,
      status,
      offset: 0,
    }));
  };

  const handleVisibilityChange = (visibility: string | undefined) => {
    setParams((prev) => ({
      ...prev,
      visibility: visibility as any,
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
        onSearch={handleSearch}
        onStatusChange={handleStatusChange}
        onVisibilityChange={handleVisibilityChange}
        onReset={handleReset}
        isLoading={isLoading}
      />

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      <MoviesList
        movies={movies}
        isLoading={isLoading}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      {totalCount > 0 && (
        <div className="flex items-center justify-between text-sm text-gray-600">
          <p>
            Showing {params.offset! + 1} to{' '}
            {Math.min(params.offset! + params.limit!, totalCount)} of{' '}
            {totalCount} movies
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              disabled={params.offset === 0 || isLoading}
              onClick={() =>
                setParams((prev) => ({
                  ...prev,
                  offset: Math.max(0, prev.offset! - prev.limit!),
                }))
              }
            >
              Previous
            </Button>
            <Button
              variant="outline"
              disabled={
                params.offset! + params.limit! >= totalCount || isLoading
              }
              onClick={() =>
                setParams((prev) => ({
                  ...prev,
                  offset: prev.offset! + prev.limit!,
                }))
              }
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
