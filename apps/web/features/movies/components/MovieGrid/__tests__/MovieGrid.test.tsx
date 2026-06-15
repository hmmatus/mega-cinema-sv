import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MovieGrid } from '../MovieGrid';
import type { Movie } from '../../../../../domain/movies/movies.types';

vi.mock('next/link', () => ({
  default: ({ href, children }: { href: string; children: React.ReactNode }) => (
    <a href={href}>{children}</a>
  ),
}));

vi.mock('next/image', () => ({
  default: ({ src, alt }: { src: string; alt: string }) => <img src={src} alt={alt} />,
}));

const makeMovie = (overrides: Partial<Movie> = {}): Movie => ({
  id: '1',
  title: 'Test Movie',
  posterUrl: null,
  durationMinutes: 120,
  genres: ['Acción'],
  status: 'RELEASED',
  visibility: 'PUBLIC',
  ...overrides,
});

describe('MovieGrid', () => {
  it('renders EmptyState when movies array is empty', () => {
    render(<MovieGrid movies={[]} />);
    expect(screen.getByText('No hay películas disponibles')).toBeInTheDocument();
  });

  it('renders a MovieCard for each movie', () => {
    const movies = [
      makeMovie({ id: '1', title: 'Movie A' }),
      makeMovie({ id: '2', title: 'Movie B' }),
    ];
    render(<MovieGrid movies={movies} />);
    expect(screen.getByText('Movie A')).toBeInTheDocument();
    expect(screen.getByText('Movie B')).toBeInTheDocument();
  });
});
