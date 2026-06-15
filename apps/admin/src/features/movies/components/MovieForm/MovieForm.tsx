'use client';

import { useState } from 'react';
import {
  Button,
  Input,
  Select,
  DatePicker,
  Checkbox,
  Card,
} from '@cinema/ui';
import type { MovieFormProps } from './types';
import type { MovieFormInput } from '@/src/domain/movies';

const RATING_OPTIONS = [
  { label: 'G', value: 'G' },
  { label: 'PG', value: 'PG' },
  { label: 'PG-13', value: 'PG13' },
  { label: 'R', value: 'R' },
  { label: 'NC-17', value: 'NC17' },
];

const STATUS_OPTIONS = [
  { label: 'Upcoming', value: 'UPCOMING' },
  { label: 'Pre-release', value: 'PRERELEASE' },
  { label: 'Released', value: 'RELEASED' },
  { label: 'Archived', value: 'ARCHIVED' },
];

const VISIBILITY_OPTIONS = [
  { label: 'Public', value: 'PUBLIC' },
  { label: 'Internal', value: 'INTERNAL' },
  { label: 'Hidden', value: 'HIDDEN' },
];

const LANGUAGE_OPTIONS = [
  { label: 'Spanish', value: 'es' },
  { label: 'English', value: 'en' },
  { label: 'French', value: 'fr' },
  { label: 'Portuguese', value: 'pt' },
];

export function MovieForm({
  initialData,
  onSubmit,
  isLoading = false,
  error,
  onCancel,
}: MovieFormProps) {
  const [formData, setFormData] = useState<MovieFormInput>({
    title: initialData?.title || '',
    description: initialData?.description || '',
    durationMinutes: initialData?.durationMinutes || 0,
    rating: (initialData?.rating as 'G' | 'PG' | 'PG13' | 'R' | 'NC17' | undefined) || undefined,
    originalLanguage: initialData?.originalLanguage || '',
    status: initialData?.status || 'UPCOMING',
    releaseDate: initialData?.releaseDate || undefined,
    posterUrl: initialData?.posterUrl || '',
    trailerUrl: initialData?.trailerUrl || '',
    director: initialData?.director || '',
    genres: initialData?.genres || [],
    cast: initialData?.cast || [],
    featured: initialData?.featured || false,
    visibility: initialData?.visibility || 'PUBLIC',
  });

  const [genreInput, setGenreInput] = useState('');
  const [castInput, setCastInput] = useState('');
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.title.trim()) {
      errors.title = 'Title is required';
    }

    if (!formData.durationMinutes || formData.durationMinutes <= 0) {
      errors.durationMinutes = 'Duration must be greater than 0';
    }

    if (!formData.status) {
      errors.status = 'Status is required';
    }

    if (!formData.visibility) {
      errors.visibility = 'Visibility is required';
    }

    if (formData.posterUrl && !isValidUrl(formData.posterUrl)) {
      errors.posterUrl = 'Invalid poster URL';
    }

    if (formData.trailerUrl && !isValidUrl(formData.trailerUrl)) {
      errors.trailerUrl = 'Invalid trailer URL';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const isValidUrl = (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleAddGenre = () => {
    if (genreInput.trim()) {
      setFormData((prev) => ({
        ...prev,
        genres: [...prev.genres, genreInput.trim()],
      }));
      setGenreInput('');
    }
  };

  const handleRemoveGenre = (genre: string) => {
    setFormData((prev) => ({
      ...prev,
      genres: prev.genres.filter((g) => g !== genre),
    }));
  };

  const handleAddCast = () => {
    if (castInput.trim()) {
      setFormData((prev) => ({
        ...prev,
        cast: [...prev.cast, castInput.trim()],
      }));
      setCastInput('');
    }
  };

  const handleRemoveCast = (castMember: string) => {
    setFormData((prev) => ({
      ...prev,
      cast: prev.cast.filter((c) => c !== castMember),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    await onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="rounded-md bg-red-50 p-4 text-sm text-red-700">
          {error.message}
        </div>
      )}

      <Card>
        <Card.Header>
          <Card.Title>Basic Information</Card.Title>
        </Card.Header>
        <Card.Content className="space-y-4">
          <div>
            <Input
              id="movie-form-title-input"
              label="Title"
              required
              value={formData.title}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, title: e.target.value }))
              }
              error={validationErrors.title}
              disabled={isLoading}
              data-testid="movie-form-title"
            />
          </div>

          <div>
            <Input
              id="movie-form-description-input"
              label="Description"
              type="textarea"
              value={formData.description || ''}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              disabled={isLoading}
              data-testid="movie-form-description"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              id="movie-form-duration-input"
              label="Duration (minutes)"
              type="number"
              required
              min="1"
              value={formData.durationMinutes}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  durationMinutes: parseInt(e.target.value, 10) || 0,
                }))
              }
              error={validationErrors.durationMinutes}
              disabled={isLoading}
              data-testid="movie-form-duration"
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Rating
              </label>
              <Select
                options={RATING_OPTIONS}
                value={formData.rating || ''}
                onChange={(value) =>
                  setFormData((prev) => ({
                    ...prev,
                    rating: value as 'G' | 'PG' | 'PG13' | 'R' | 'NC17' | undefined,
                  }))
                }
                disabled={isLoading}
                data-testid="movie-form-rating"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Original Language
              </label>
              <Select
                options={LANGUAGE_OPTIONS}
                value={formData.originalLanguage || ''}
                onChange={(value) =>
                  setFormData((prev) => ({ ...prev, originalLanguage: value }))
                }
                disabled={isLoading}
                data-testid="movie-form-language"
              />
            </div>

            <Input
              id="movie-form-director-input"
              label="Director"
              value={formData.director || ''}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, director: e.target.value }))
              }
              disabled={isLoading}
              data-testid="movie-form-director"
            />
          </div>
        </Card.Content>
      </Card>

      <Card>
        <Card.Header>
          <Card.Title>Status & Visibility</Card.Title>
        </Card.Header>
        <Card.Content className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status <span className="text-red-500">*</span>
              </label>
              <Select
                options={STATUS_OPTIONS}
                value={formData.status}
                onChange={(value) =>
                  setFormData((prev) => ({
                    ...prev,
                    status: value as 'UPCOMING' | 'PRERELEASE' | 'RELEASED' | 'ARCHIVED',
                  }))
                }
                disabled={isLoading}
                data-testid="movie-form-status"
              />
              {validationErrors.status && (
                <p className="mt-1 text-xs text-red-500">{validationErrors.status}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Visibility <span className="text-red-500">*</span>
              </label>
              <Select
                options={VISIBILITY_OPTIONS}
                value={formData.visibility}
                onChange={(value) =>
                  setFormData((prev) => ({
                    ...prev,
                    visibility: value as 'PUBLIC' | 'INTERNAL' | 'HIDDEN',
                  }))
                }
                disabled={isLoading}
                data-testid="movie-form-visibility"
              />
              {validationErrors.visibility && (
                <p className="mt-1 text-xs text-red-500">{validationErrors.visibility}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Release Date
            </label>
            <DatePicker
              value={formData.releaseDate}
              onChange={(date) =>
                setFormData((prev) => ({ ...prev, releaseDate: date }))
              }
              data-testid="movie-form-release-date"
            />
          </div>

          <div>
            <Checkbox
              id="movie-form-featured-checkbox"
              label="Featured"
              checked={formData.featured}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  featured: (e.target as HTMLInputElement).checked,
                }))
              }
              disabled={isLoading}
              data-testid="movie-form-featured"
            />
          </div>
        </Card.Content>
      </Card>

      <Card>
        <Card.Header>
          <Card.Title>Media</Card.Title>
        </Card.Header>
        <Card.Content className="space-y-4">
          <div>
            <Input
              id="movie-form-poster-url-input"
              label="Poster URL"
              type="url"
              value={formData.posterUrl || ''}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, posterUrl: e.target.value }))
              }
              error={validationErrors.posterUrl}
              disabled={isLoading}
              data-testid="movie-form-poster-url"
            />
          </div>

          <div>
            <Input
              id="movie-form-trailer-url-input"
              label="Trailer URL"
              type="url"
              value={formData.trailerUrl || ''}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  trailerUrl: e.target.value,
                }))
              }
              error={validationErrors.trailerUrl}
              disabled={isLoading}
              data-testid="movie-form-trailer-url"
            />
          </div>
        </Card.Content>
      </Card>

      <Card>
        <Card.Header>
          <Card.Title>Genres</Card.Title>
        </Card.Header>
        <Card.Content className="space-y-4">
          <div className="flex gap-2">
            <Input
              id="movie-form-genre-input-field"
              placeholder="Add genre..."
              value={genreInput}
              onChange={(e) => setGenreInput(e.target.value)}
              disabled={isLoading}
              data-testid="movie-form-genre-input"
            />
            <Button
              type="button"
              onClick={handleAddGenre}
              disabled={isLoading || !genreInput.trim()}
              data-testid="movie-form-add-genre"
            >
              Add
            </Button>
          </div>

          {formData.genres.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {formData.genres.map((genre) => (
                <div
                  key={genre}
                  className="flex items-center gap-2 rounded-md bg-gray-200 px-3 py-1 text-sm"
                  data-testid={`movie-form-genre-tag-${genre}`}
                >
                  {genre}
                  <button
                    type="button"
                    onClick={() => handleRemoveGenre(genre)}
                    className="text-gray-600 hover:text-gray-800"
                    data-testid={`movie-form-remove-genre-${genre}`}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </Card.Content>
      </Card>

      <Card>
        <Card.Header>
          <Card.Title>Cast</Card.Title>
        </Card.Header>
        <Card.Content className="space-y-4">
          <div className="flex gap-2">
            <Input
              id="movie-form-cast-input-field"
              placeholder="Add cast member..."
              value={castInput}
              onChange={(e) => setCastInput(e.target.value)}
              disabled={isLoading}
              data-testid="movie-form-cast-input"
            />
            <Button
              type="button"
              onClick={handleAddCast}
              disabled={isLoading || !castInput.trim()}
              data-testid="movie-form-add-cast"
            >
              Add
            </Button>
          </div>

          {formData.cast.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {formData.cast.map((castMember) => (
                <div
                  key={castMember}
                  className="flex items-center gap-2 rounded-md bg-blue-200 px-3 py-1 text-sm"
                  data-testid={`movie-form-cast-tag-${castMember}`}
                >
                  {castMember}
                  <button
                    type="button"
                    onClick={() => handleRemoveCast(castMember)}
                    className="text-blue-600 hover:text-blue-800"
                    data-testid={`movie-form-remove-cast-${castMember}`}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </Card.Content>
      </Card>

      <div className="flex gap-3">
        <Button
          type="submit"
          disabled={isLoading}
          data-testid="movie-form-submit"
        >
          {isLoading ? 'Saving...' : (initialData && 'id' in initialData && initialData.id) ? 'Update' : 'Create'}
        </Button>

        {onCancel && (
          <Button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
            data-testid="movie-form-cancel"
          >
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}
