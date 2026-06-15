import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import { MoviesList } from './MoviesList';
import type { Movie } from '@/src/domain/movies';

const mockMovies: Movie[] = [
  {
    id: '550e8400-e29b-41d4-a716-446655440000',
    title: 'The Matrix',
    description: 'A sci-fi classic',
    durationMinutes: 136,
    rating: 'R',
    originalLanguage: 'English',
    status: 'RELEASED',
    releaseDate: new Date('1999-03-31'),
    posterUrl: 'https://example.com/matrix.jpg',
    trailerUrl: 'https://example.com/trailer.mp4',
    director: 'Lana Wachowski, Lilly Wachowski',
    genres: ['Sci-Fi', 'Action'],
    cast: ['Keanu Reeves', 'Laurence Fishburne'],
    featured: true,
    visibility: 'PUBLIC',
    metadata: null,
    createdById: '550e8400-e29b-41d4-a716-446655440001',
    updatedById: '550e8400-e29b-41d4-a716-446655440001',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-02'),
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440002',
    title: 'Inception',
    description: 'A mind-bending thriller',
    durationMinutes: 148,
    rating: 'PG13',
    originalLanguage: 'English',
    status: 'UPCOMING',
    releaseDate: new Date('2010-07-16'),
    posterUrl: 'https://example.com/inception.jpg',
    trailerUrl: 'https://example.com/inception-trailer.mp4',
    director: 'Christopher Nolan',
    genres: ['Sci-Fi', 'Thriller'],
    cast: ['Leonardo DiCaprio', 'Marion Cotillard'],
    featured: true,
    visibility: 'PUBLIC',
    metadata: null,
    createdById: '550e8400-e29b-41d4-a716-446655440001',
    updatedById: '550e8400-e29b-41d4-a716-446655440001',
    createdAt: new Date('2024-01-03'),
    updatedAt: new Date('2024-01-04'),
  },
];

describe('MoviesList', () => {
  const mockOnEdit = vi.fn();
  const mockOnDelete = vi.fn();

  beforeEach(() => {
    mockOnEdit.mockClear();
    mockOnDelete.mockClear();
  });

  it('should render movies table with headers', () => {
    render(
      <MoviesList
        movies={mockMovies}
        isLoading={false}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    expect(screen.getByText('Películas')).toBeInTheDocument();
    expect(screen.getByText('Póster')).toBeInTheDocument();
    expect(screen.getByText('Título')).toBeInTheDocument();
    expect(screen.getByText('Estado')).toBeInTheDocument();
    expect(screen.getByText('Visibilidad')).toBeInTheDocument();
    expect(screen.getByText('Creado')).toBeInTheDocument();
    expect(screen.getByText('Acciones')).toBeInTheDocument();
  });

  it('should render movie rows with data', () => {
    render(
      <MoviesList
        movies={mockMovies}
        isLoading={false}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    expect(screen.getByText('The Matrix')).toBeInTheDocument();
    expect(screen.getByText('Inception')).toBeInTheDocument();
  });

  it('should render status badges', () => {
    render(
      <MoviesList
        movies={mockMovies}
        isLoading={false}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    expect(screen.getByText('RELEASED')).toBeInTheDocument();
    expect(screen.getByText('UPCOMING')).toBeInTheDocument();
  });

  it('should render visibility badges', () => {
    render(
      <MoviesList
        movies={mockMovies}
        isLoading={false}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    const publicBadges = screen.getAllByText('PUBLIC');
    expect(publicBadges.length).toBeGreaterThan(0);
  });

  it('should call onEdit when edit button is clicked', async () => {
    const { getByRole } = render(
      <MoviesList
        movies={mockMovies}
        isLoading={false}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    const editButtons = screen.getAllByText('Editar');
    expect(editButtons.length).toBeGreaterThan(0);
  });

  it('should call onDelete when delete button is clicked', async () => {
    render(
      <MoviesList
        movies={mockMovies}
        isLoading={false}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    const deleteButtons = screen.getAllByText('Eliminar');
    expect(deleteButtons.length).toBeGreaterThan(0);
  });

  it('should display loading skeleton when isLoading is true', () => {
    render(
      <MoviesList
        movies={[]}
        isLoading={true}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    // Loading state shows skeleton rows
    const skeletonRows = document.querySelectorAll('.animate-pulse');
    expect(skeletonRows.length).toBeGreaterThan(0);
  });

  it('should display empty message when no movies', () => {
    render(
      <MoviesList
        movies={[]}
        isLoading={false}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    expect(screen.getByText('No hay películas')).toBeInTheDocument();
  });

  it('should render poster images', () => {
    render(
      <MoviesList
        movies={mockMovies}
        isLoading={false}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    const images = screen.getAllByRole('img');
    expect(images.length).toBeGreaterThan(0);
  });
});
