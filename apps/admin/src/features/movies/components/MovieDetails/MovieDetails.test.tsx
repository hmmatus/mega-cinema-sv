import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MovieDetails } from './MovieDetails';
import type { MovieDetailsProps } from './types';
import type { Movie } from '@/src/domain/movies';

describe('MovieDetails', () => {
  const mockMovie: Movie = {
    id: '123',
    title: 'The Matrix',
    description: 'A sci-fi masterpiece',
    durationMinutes: 136,
    rating: 'R',
    originalLanguage: 'en',
    status: 'RELEASED',
    releaseDate: new Date('1999-03-31').toISOString(),
    posterUrl: 'https://example.com/poster.jpg',
    trailerUrl: 'https://example.com/trailer.mp4',
    director: 'The Wachowskis',
    genres: ['Sci-Fi', 'Action'],
    cast: ['Keanu Reeves', 'Laurence Fishburne'],
    featured: true,
    visibility: 'PUBLIC',
    createdAt: new Date('2024-01-01').toISOString(),
    updatedAt: new Date('2024-06-01').toISOString(),
  };

  const defaultProps: MovieDetailsProps = {
    movieId: '123',
    movie: mockMovie,
    isLoading: false,
    error: undefined,
    onEdit: vi.fn(),
  };

  describe('Rendering', () => {
    it('should render movie title', () => {
      render(<MovieDetails {...defaultProps} />);
      expect(screen.getByText('The Matrix')).toBeInTheDocument();
    });

    it('should display loading state', () => {
      render(<MovieDetails {...defaultProps} isLoading={true} movie={undefined} />);
      expect(screen.getByText('Loading movie details...')).toBeInTheDocument();
    });

    it('should display error state', () => {
      render(
        <MovieDetails
          {...defaultProps}
          movie={undefined}
          error="Failed to load movie"
        />
      );
      expect(screen.getByText('Failed to load movie')).toBeInTheDocument();
    });

    it('should display not found state', () => {
      render(
        <MovieDetails
          {...defaultProps}
          movie={undefined}
          isLoading={false}
        />
      );
      expect(screen.getByText('Movie not found')).toBeInTheDocument();
    });
  });

  describe('Movie Information Display', () => {
    it('should display movie status and visibility badges', () => {
      render(<MovieDetails {...defaultProps} />);
      expect(screen.getByText('RELEASED')).toBeInTheDocument();
      expect(screen.getByText('PUBLIC')).toBeInTheDocument();
    });

    it('should display duration', () => {
      render(<MovieDetails {...defaultProps} />);
      expect(screen.getByText('136 min')).toBeInTheDocument();
    });

    it('should display description', () => {
      render(<MovieDetails {...defaultProps} />);
      expect(screen.getByText('A sci-fi masterpiece')).toBeInTheDocument();
    });

    it('should display poster image', () => {
      render(<MovieDetails {...defaultProps} />);
      const img = screen.getByAltText('The Matrix');
      expect(img).toHaveAttribute('src', 'https://example.com/poster.jpg');
    });

    it('should display release date', () => {
      render(<MovieDetails {...defaultProps} />);
      expect(screen.getByText(/Release Date:/)).toBeInTheDocument();
    });

    it('should display rating', () => {
      render(<MovieDetails {...defaultProps} />);
      expect(screen.getByText('R')).toBeInTheDocument();
    });

    it('should display original language', () => {
      render(<MovieDetails {...defaultProps} />);
      expect(screen.getByText('en')).toBeInTheDocument();
    });

    it('should display director', () => {
      render(<MovieDetails {...defaultProps} />);
      expect(screen.getByText('The Wachowskis')).toBeInTheDocument();
    });

    it('should display featured status', () => {
      render(<MovieDetails {...defaultProps} />);
      expect(screen.getByText('Yes')).toBeInTheDocument();
    });
  });

  describe('Genres Display', () => {
    it('should display all genres', () => {
      render(<MovieDetails {...defaultProps} />);
      expect(screen.getByText('Sci-Fi')).toBeInTheDocument();
      expect(screen.getByText('Action')).toBeInTheDocument();
    });

    it('should not display genres section if no genres', () => {
      const movieWithoutGenres = { ...mockMovie, genres: [] };
      render(<MovieDetails {...defaultProps} movie={movieWithoutGenres} />);
      // Check that the section is not rendered
      const genreCards = screen.queryAllByText('Genres');
      expect(genreCards).toHaveLength(0);
    });
  });

  describe('Cast Display', () => {
    it('should display all cast members', () => {
      render(<MovieDetails {...defaultProps} />);
      expect(screen.getByText('Keanu Reeves')).toBeInTheDocument();
      expect(screen.getByText('Laurence Fishburne')).toBeInTheDocument();
    });

    it('should not display cast section if no cast', () => {
      const movieWithoutCast = { ...mockMovie, cast: [] };
      render(<MovieDetails {...defaultProps} movie={movieWithoutCast} />);
      const castCards = screen.queryAllByText('Cast');
      expect(castCards).toHaveLength(0);
    });
  });

  describe('Media Links', () => {
    it('should display trailer link', () => {
      render(<MovieDetails {...defaultProps} />);
      const trailerLink = screen.getByRole('link', { name: /Watch Trailer/i });
      expect(trailerLink).toHaveAttribute('href', 'https://example.com/trailer.mp4');
      expect(trailerLink).toHaveAttribute('target', '_blank');
    });

    it('should not display trailer section if no trailer', () => {
      const movieWithoutTrailer = { ...mockMovie, trailerUrl: undefined };
      render(<MovieDetails {...defaultProps} movie={movieWithoutTrailer} />);
      const trailerLinks = screen.queryAllByText('Watch Trailer');
      expect(trailerLinks).toHaveLength(0);
    });
  });

  describe('Actions', () => {
    it('should call onEdit when edit button clicked', async () => {
      const onEdit = vi.fn();
      const user = userEvent.setup();
      render(<MovieDetails {...defaultProps} onEdit={onEdit} />);

      const editButton = screen.getByRole('button', { name: /Edit/i });
      await user.click(editButton);

      expect(onEdit).toHaveBeenCalledWith('123');
    });

    it('should call onBack when back button clicked', async () => {
      const onBack = vi.fn();
      const user = userEvent.setup();
      render(<MovieDetails {...defaultProps} onBack={onBack} />);

      const backButton = screen.getByRole('button', { name: /Back/i });
      await user.click(backButton);

      expect(onBack).toHaveBeenCalled();
    });

    it('should not display edit button if onEdit not provided', () => {
      render(<MovieDetails {...defaultProps} onEdit={undefined} />);
      const editButton = screen.queryByRole('button', { name: /Edit/i });
      expect(editButton).not.toBeInTheDocument();
    });

    it('should not display back button if onBack not provided', () => {
      render(<MovieDetails {...defaultProps} onBack={undefined} />);
      const backButton = screen.queryByRole('button', { name: /Back/i });
      expect(backButton).not.toBeInTheDocument();
    });
  });

  describe('Optional Fields', () => {
    it('should display N/A for missing optional fields', () => {
      const movieWithoutOptionals = {
        ...mockMovie,
        rating: undefined,
        director: undefined,
        trailerUrl: undefined,
      };
      render(<MovieDetails {...defaultProps} movie={movieWithoutOptionals} />);
      expect(screen.getAllByText('N/A').length).toBeGreaterThan(0);
    });

    it('should not display poster if posterUrl is missing', () => {
      const movieWithoutPoster = { ...mockMovie, posterUrl: undefined };
      render(<MovieDetails {...defaultProps} movie={movieWithoutPoster} />);
      const img = screen.queryByAltText('The Matrix');
      expect(img).not.toBeInTheDocument();
    });

    it('should not display description section if no description', () => {
      const movieWithoutDescription = { ...mockMovie, description: undefined };
      render(<MovieDetails {...defaultProps} movie={movieWithoutDescription} />);
      expect(screen.getByText('No description')).toBeInTheDocument();
    });
  });
});
