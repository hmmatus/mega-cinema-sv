import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MovieCard } from '../MovieCard';
import type { Movie } from '../../../../../domain/movies/movies.types';

vi.mock('next/link', () => ({
  default: ({ href, children }: { href: string; children: React.ReactNode }) => (
    <a href={href}>{children}</a>
  ),
}));

vi.mock('next/image', () => ({
  default: ({ src, alt }: { src: string; alt: string }) => <img src={src} alt={alt} />,
}));

const baseMovie: Movie = {
  id: 'abc',
  title: 'La Gran Vía',
  posterUrl: null,
  durationMinutes: 128,
  genres: ['Drama'],
  status: 'RELEASED',
  visibility: 'PUBLIC',
};

describe('MovieCard', () => {
  it('renders title and meta', () => {
    render(<MovieCard movie={baseMovie} />);
    expect(screen.getByText('La Gran Vía')).toBeInTheDocument();
    expect(screen.getByText('Drama · 2h 08m')).toBeInTheDocument();
  });

  it('shows ESTRENO badge for RELEASED status', () => {
    render(<MovieCard movie={baseMovie} />);
    expect(screen.getByText('ESTRENO')).toBeInTheDocument();
  });

  it('shows Preventa badge for PRERELEASE status', () => {
    render(<MovieCard movie={{ ...baseMovie, status: 'PRERELEASE' }} />);
    expect(screen.getByText('Preventa')).toBeInTheDocument();
  });

  it('shows no badge for UPCOMING status', () => {
    render(<MovieCard movie={{ ...baseMovie, status: 'UPCOMING' }} />);
    expect(screen.queryByText('ESTRENO')).not.toBeInTheDocument();
    expect(screen.queryByText('Preventa')).not.toBeInTheDocument();
  });

  it('renders poster image when posterUrl is provided', () => {
    render(<MovieCard movie={{ ...baseMovie, posterUrl: 'https://example.com/poster.jpg' }} />);
    expect(screen.getByAltText('La Gran Vía')).toBeInTheDocument();
  });

  it('renders placeholder when posterUrl is null', () => {
    render(<MovieCard movie={baseMovie} />);
    expect(screen.queryByAltText('La Gran Vía')).not.toBeInTheDocument();
  });

  it('links to movie detail page', () => {
    render(<MovieCard movie={baseMovie} />);
    expect(screen.getByRole('link')).toHaveAttribute('href', '/peliculas/abc');
  });
});
