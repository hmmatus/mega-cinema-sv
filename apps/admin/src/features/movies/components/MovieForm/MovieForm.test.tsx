import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MovieForm } from './MovieForm';
import type { MovieFormProps } from './types';

describe('MovieForm', () => {
  let mockOnSubmit: jest.Mock;
  let mockOnCancel: jest.Mock;

  beforeEach(() => {
    mockOnSubmit = vi.fn().mockResolvedValue(undefined);
    mockOnCancel = vi.fn();
  });

  const renderComponent = (props?: Partial<MovieFormProps>) => {
    return render(
      <MovieForm
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
        {...props}
      />
    );
  };

  describe('Rendering', () => {
    it('should render form with all required fields', () => {
      renderComponent();

      expect(screen.getByTestId('movie-form-title')).toBeInTheDocument();
      expect(screen.getByTestId('movie-form-duration')).toBeInTheDocument();
      expect(screen.getByTestId('movie-form-status')).toBeInTheDocument();
      expect(screen.getByTestId('movie-form-visibility')).toBeInTheDocument();
    });

    it('should render optional fields', () => {
      renderComponent();

      expect(screen.getByTestId('movie-form-description')).toBeInTheDocument();
      expect(screen.getByTestId('movie-form-rating')).toBeInTheDocument();
      expect(screen.getByTestId('movie-form-language')).toBeInTheDocument();
      expect(screen.getByTestId('movie-form-director')).toBeInTheDocument();
      expect(screen.getByTestId('movie-form-poster-url')).toBeInTheDocument();
      expect(screen.getByTestId('movie-form-trailer-url')).toBeInTheDocument();
      expect(screen.getByTestId('movie-form-featured')).toBeInTheDocument();
      expect(screen.getByTestId('movie-form-genre-input')).toBeInTheDocument();
      expect(screen.getByTestId('movie-form-cast-input')).toBeInTheDocument();
    });

    it('should render submit button with create label when no initial data', () => {
      renderComponent();

      expect(screen.getByTestId('movie-form-submit')).toHaveTextContent('Create');
    });

    it('should render submit button with update label when editing', () => {
      renderComponent({
        initialData: {
          id: '123',
          title: 'Test Movie',
          durationMinutes: 120,
          status: 'RELEASED',
          visibility: 'PUBLIC',
          genres: [],
          cast: [],
          featured: false,
        },
      });

      expect(screen.getByTestId('movie-form-submit')).toHaveTextContent('Update');
    });

    it('should render cancel button when onCancel provided', () => {
      renderComponent();

      expect(screen.getByTestId('movie-form-cancel')).toBeInTheDocument();
    });

    it('should not render cancel button when onCancel not provided', () => {
      render(
        <MovieForm
          onSubmit={mockOnSubmit}
        />
      );

      expect(screen.queryByTestId('movie-form-cancel')).not.toBeInTheDocument();
    });
  });

  describe('Initial Data Population', () => {
    it('should populate form with initial data', async () => {
      const initialData = {
        id: '123',
        title: 'The Matrix',
        description: 'A sci-fi classic',
        durationMinutes: 136,
        rating: 'R',
        originalLanguage: 'en',
        status: 'RELEASED' as const,
        releaseDate: new Date('1999-03-31'),
        posterUrl: 'https://example.com/poster.jpg',
        trailerUrl: 'https://example.com/trailer.mp4',
        director: 'The Wachowskis',
        genres: ['Sci-Fi', 'Action'],
        cast: ['Keanu Reeves', 'Laurence Fishburne'],
        featured: true,
        visibility: 'PUBLIC' as const,
      };

      renderComponent({ initialData });

      const titleInput = screen.getByTestId('movie-form-title') as HTMLInputElement;
      expect(titleInput.value).toBe('The Matrix');

      const durationInput = screen.getByTestId('movie-form-duration') as HTMLInputElement;
      expect(durationInput.value).toBe('136');
    });
  });

  describe('Validation', () => {
    it('should require title', async () => {
      const user = userEvent.setup();
      renderComponent();

      await user.click(screen.getByTestId('movie-form-submit'));

      await waitFor(() => {
        expect(screen.getByText('Title is required')).toBeInTheDocument();
      });

      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it('should require duration > 0', async () => {
      const user = userEvent.setup();
      renderComponent();

      const titleInput = screen.getByTestId('movie-form-title');
      await user.type(titleInput, 'Test Movie');

      const durationInput = screen.getByTestId('movie-form-duration') as HTMLInputElement;
      await user.clear(durationInput);
      await user.type(durationInput, '0');

      await user.click(screen.getByTestId('movie-form-submit'));

      await waitFor(() => {
        expect(screen.getByText('Duration must be greater than 0')).toBeInTheDocument();
      });

      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it('should require status', async () => {
      const user = userEvent.setup();
      renderComponent();

      const titleInput = screen.getByTestId('movie-form-title');
      await user.type(titleInput, 'Test Movie');

      const durationInput = screen.getByTestId('movie-form-duration');
      await user.type(durationInput, '120');

      // Assuming Select defaults to empty, try to submit
      await user.click(screen.getByTestId('movie-form-submit'));

      await waitFor(() => {
        expect(screen.getByText('Status is required')).toBeInTheDocument();
      });

      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it('should require visibility', async () => {
      const user = userEvent.setup();
      renderComponent();

      const titleInput = screen.getByTestId('movie-form-title');
      await user.type(titleInput, 'Test Movie');

      const durationInput = screen.getByTestId('movie-form-duration');
      await user.type(durationInput, '120');

      await user.click(screen.getByTestId('movie-form-submit'));

      await waitFor(() => {
        expect(screen.getByText('Visibility is required')).toBeInTheDocument();
      });

      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it('should validate poster URL format', async () => {
      const user = userEvent.setup();
      renderComponent();

      const titleInput = screen.getByTestId('movie-form-title');
      await user.type(titleInput, 'Test Movie');

      const durationInput = screen.getByTestId('movie-form-duration');
      await user.type(durationInput, '120');

      const posterInput = screen.getByTestId('movie-form-poster-url');
      await user.type(posterInput, 'not-a-valid-url');

      await user.click(screen.getByTestId('movie-form-submit'));

      await waitFor(() => {
        expect(screen.getByText('Invalid poster URL')).toBeInTheDocument();
      });

      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it('should validate trailer URL format', async () => {
      const user = userEvent.setup();
      renderComponent();

      const titleInput = screen.getByTestId('movie-form-title');
      await user.type(titleInput, 'Test Movie');

      const durationInput = screen.getByTestId('movie-form-duration');
      await user.type(durationInput, '120');

      const trailerInput = screen.getByTestId('movie-form-trailer-url');
      await user.type(trailerInput, 'invalid-url');

      await user.click(screen.getByTestId('movie-form-submit'));

      await waitFor(() => {
        expect(screen.getByText('Invalid trailer URL')).toBeInTheDocument();
      });

      expect(mockOnSubmit).not.toHaveBeenCalled();
    });
  });

  describe('Form Submission', () => {
    it('should submit form with valid data', async () => {
      const user = userEvent.setup();
      renderComponent();

      const titleInput = screen.getByTestId('movie-form-title');
      await user.type(titleInput, 'Test Movie');

      const durationInput = screen.getByTestId('movie-form-duration');
      await user.type(durationInput, '120');

      await user.click(screen.getByTestId('movie-form-submit'));

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalled();
      });

      const submittedData = mockOnSubmit.mock.calls[0][0];
      expect(submittedData.title).toBe('Test Movie');
      expect(submittedData.durationMinutes).toBe(120);
    });

    it('should disable form while submitting', async () => {
      renderComponent({ isLoading: true });

      const titleInput = screen.getByTestId('movie-form-title') as HTMLInputElement;
      expect(titleInput.disabled).toBe(true);

      const submitButton = screen.getByTestId('movie-form-submit') as HTMLButtonElement;
      expect(submitButton.disabled).toBe(true);
    });

    it('should display error message on submission failure', () => {
      const error = new Error('Failed to create movie');
      renderComponent({ error });

      expect(screen.getByText('Failed to create movie')).toBeInTheDocument();
    });
  });

  describe('Genre Management', () => {
    it('should add genre', async () => {
      const user = userEvent.setup();
      renderComponent();

      const genreInput = screen.getByTestId('movie-form-genre-input');
      await user.type(genreInput, 'Action');

      await user.click(screen.getByTestId('movie-form-add-genre'));

      expect(screen.getByTestId('movie-form-genre-tag-Action')).toBeInTheDocument();
      expect((genreInput as HTMLInputElement).value).toBe('');
    });

    it('should remove genre', async () => {
      const user = userEvent.setup();
      const initialData = {
        title: 'Test',
        durationMinutes: 120,
        status: 'RELEASED' as const,
        visibility: 'PUBLIC' as const,
        genres: ['Action', 'Sci-Fi'],
        cast: [],
        featured: false,
      };

      renderComponent({ initialData });

      const removeButton = screen.getByTestId('movie-form-remove-genre-Action');
      await user.click(removeButton);

      expect(screen.queryByTestId('movie-form-genre-tag-Action')).not.toBeInTheDocument();
      expect(screen.getByTestId('movie-form-genre-tag-Sci-Fi')).toBeInTheDocument();
    });

    it('should not add empty genre', async () => {
      const user = userEvent.setup();
      renderComponent();

      const addButton = screen.getByTestId('movie-form-add-genre') as HTMLButtonElement;
      expect(addButton.disabled).toBe(true);
    });

    it('should not add whitespace-only genre', async () => {
      const user = userEvent.setup();
      renderComponent();

      const genreInput = screen.getByTestId('movie-form-genre-input');
      await user.type(genreInput, '   ');

      const addButton = screen.getByTestId('movie-form-add-genre') as HTMLButtonElement;
      expect(addButton.disabled).toBe(true);
    });
  });

  describe('Cast Management', () => {
    it('should add cast member', async () => {
      const user = userEvent.setup();
      renderComponent();

      const castInput = screen.getByTestId('movie-form-cast-input');
      await user.type(castInput, 'Tom Hanks');

      await user.click(screen.getByTestId('movie-form-add-cast'));

      expect(screen.getByTestId('movie-form-cast-tag-Tom Hanks')).toBeInTheDocument();
      expect((castInput as HTMLInputElement).value).toBe('');
    });

    it('should remove cast member', async () => {
      const user = userEvent.setup();
      const initialData = {
        title: 'Test',
        durationMinutes: 120,
        status: 'RELEASED' as const,
        visibility: 'PUBLIC' as const,
        genres: [],
        cast: ['Tom Hanks', 'Meg Ryan'],
        featured: false,
      };

      renderComponent({ initialData });

      const removeButton = screen.getByTestId('movie-form-remove-cast-Tom Hanks');
      await user.click(removeButton);

      expect(screen.queryByTestId('movie-form-cast-tag-Tom Hanks')).not.toBeInTheDocument();
      expect(screen.getByTestId('movie-form-cast-tag-Meg Ryan')).toBeInTheDocument();
    });

    it('should not add empty cast member', async () => {
      const user = userEvent.setup();
      renderComponent();

      const addButton = screen.getByTestId('movie-form-add-cast') as HTMLButtonElement;
      expect(addButton.disabled).toBe(true);
    });
  });

  describe('Cancel Button', () => {
    it('should call onCancel when cancel button clicked', async () => {
      const user = userEvent.setup();
      renderComponent();

      await user.click(screen.getByTestId('movie-form-cancel'));

      expect(mockOnCancel).toHaveBeenCalled();
    });

    it('should not clear form when cancel clicked', async () => {
      const user = userEvent.setup();
      renderComponent();

      const titleInput = screen.getByTestId('movie-form-title') as HTMLInputElement;
      await user.type(titleInput, 'Test Movie');

      expect(titleInput.value).toBe('Test Movie');

      await user.click(screen.getByTestId('movie-form-cancel'));

      expect(titleInput.value).toBe('Test Movie');
    });
  });

  describe('Featured Checkbox', () => {
    it('should toggle featured checkbox', async () => {
      const user = userEvent.setup();
      renderComponent();

      const checkbox = screen.getByTestId('movie-form-featured') as HTMLInputElement;
      expect(checkbox.checked).toBe(false);

      await user.click(checkbox);

      expect(checkbox.checked).toBe(true);
    });
  });
});
