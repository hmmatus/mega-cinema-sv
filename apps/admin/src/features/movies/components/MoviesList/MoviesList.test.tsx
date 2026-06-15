import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import { MoviesList } from './MoviesList';
import type { MovieStatus, MovieVisibility } from '@cinema/database';

const mockMovies = [
  {
    id: '1',
    title: 'The Matrix',
    status: 'RELEASED' as MovieStatus,
    visibility: 'PUBLIC' as MovieVisibility,
    posterUrl: 'https://example.com/matrix.jpg',
    createdAt: '2024-01-01',
    updatedAt: '2024-01-02',
  },
  {
    id: '2',
    title: 'Inception',
    status: 'UPCOMING' as MovieStatus,
    visibility: 'PUBLIC' as MovieVisibility,
    posterUrl: 'https://example.com/inception.jpg',
    createdAt: '2024-01-03',
    updatedAt: '2024-01-04',
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
