'use client';

import { Badge, Button, Card } from '@cinema/ui';
import type { MovieDetailsProps } from './types';
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

export function MovieDetails({
  movieId,
  movie,
  isLoading = false,
  error,
  onEdit,
  onBack,
}: MovieDetailsProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center">
        <p className="text-gray-500">Loading movie details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4">
        <p className="text-red-800">{error}</p>
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-4">
        <p className="text-gray-500">Movie not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">{movie.title}</h1>
        <div className="flex gap-2">
          {onBack && (
            <Button variant="outline" onClick={onBack}>
              Back
            </Button>
          )}
          {onEdit && (
            <Button onClick={() => onEdit(movieId)}>Edit</Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card title="Status">
          <Badge variant={getStatusBadgeVariant(movie.status)}>
            {movie.status}
          </Badge>
        </Card>
        <Card title="Visibility">
          <Badge variant={getVisibilityBadgeVariant(movie.visibility)}>
            {movie.visibility}
          </Badge>
        </Card>
        <Card title="Duration">
          <p className="text-lg font-semibold">{movie.durationMinutes} min</p>
        </Card>
      </div>

      <Card title="Overview">
        {movie.posterUrl && (
          <img
            src={movie.posterUrl}
            alt={movie.title}
            className="mb-4 max-h-64 w-auto rounded object-cover"
          />
        )}
        <p className="text-gray-700">{movie.description || 'No description'}</p>
      </Card>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Card title="Release Information">
          <div className="space-y-2 text-sm">
            <p>
              <span className="font-medium">Release Date:</span>{' '}
              {movie.releaseDate
                ? formatDate(new Date(movie.releaseDate))
                : 'N/A'}
            </p>
            <p>
              <span className="font-medium">Rating:</span> {movie.rating || 'N/A'}
            </p>
            <p>
              <span className="font-medium">Original Language:</span>{' '}
              {movie.originalLanguage || 'N/A'}
            </p>
            <p>
              <span className="font-medium">Director:</span>{' '}
              {movie.director || 'N/A'}
            </p>
          </div>
        </Card>

        <Card title="Content Information">
          <div className="space-y-2 text-sm">
            <p>
              <span className="font-medium">Featured:</span>{' '}
              {movie.featured ? 'Yes' : 'No'}
            </p>
            <p>
              <span className="font-medium">Created:</span>{' '}
              {formatDate(new Date(movie.createdAt))}
            </p>
            <p>
              <span className="font-medium">Updated:</span>{' '}
              {formatDate(new Date(movie.updatedAt))}
            </p>
          </div>
        </Card>
      </div>

      {movie.genres && movie.genres.length > 0 && (
        <Card title="Genres">
          <div className="flex flex-wrap gap-2">
            {movie.genres.map((genre) => (
              <Badge key={genre} variant="outline">
                {genre}
              </Badge>
            ))}
          </div>
        </Card>
      )}

      {movie.cast && movie.cast.length > 0 && (
        <Card title="Cast">
          <ul className="space-y-1 text-sm text-gray-700">
            {movie.cast.map((actor) => (
              <li key={actor}>• {actor}</li>
            ))}
          </ul>
        </Card>
      )}

      {movie.trailerUrl && (
        <Card title="Trailer">
          <a
            href={movie.trailerUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline"
          >
            Watch Trailer
          </a>
        </Card>
      )}
    </div>
  );
}
