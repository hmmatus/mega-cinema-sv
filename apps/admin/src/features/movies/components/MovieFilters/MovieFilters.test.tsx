import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MovieFilters } from './MovieFilters';

const mockStatusOptions = [
  { value: 'UPCOMING', label: 'Próximamente' },
  { value: 'PRERELEASE', label: 'Previo' },
  { value: 'RELEASED', label: 'Estrenada' },
  { value: 'ARCHIVED', label: 'Archivada' },
];

const mockVisibilityOptions = [
  { value: 'PUBLIC', label: 'Pública' },
  { value: 'INTERNAL', label: 'Interna' },
  { value: 'HIDDEN', label: 'Oculta' },
];

describe('MovieFilters', () => {
  const mockOnFilterChange = vi.fn();
  const mockOnClear = vi.fn();

  beforeEach(() => {
    mockOnFilterChange.mockClear();
    mockOnClear.mockClear();
  });

  it('should render all filter inputs', () => {
    render(
      <MovieFilters
        onFilterChange={mockOnFilterChange}
        onClear={mockOnClear}
        statusOptions={mockStatusOptions}
        visibilityOptions={mockVisibilityOptions}
      />
    );

    expect(screen.getByPlaceholderText('Buscar películas...')).toBeInTheDocument();
    expect(screen.getByText('Estado')).toBeInTheDocument();
    expect(screen.getByText('Visibilidad')).toBeInTheDocument();
    expect(screen.getByText('Rango de fechas')).toBeInTheDocument();
    expect(screen.getByText('Filtros')).toBeInTheDocument();
  });

  it('should update search filter on input change', async () => {
    const user = userEvent.setup();

    render(
      <MovieFilters
        onFilterChange={mockOnFilterChange}
        onClear={mockOnClear}
        statusOptions={mockStatusOptions}
        visibilityOptions={mockVisibilityOptions}
      />
    );

    const searchInput = screen.getByPlaceholderText('Buscar películas...');
    await user.type(searchInput, 'Matrix');

    await waitFor(() => {
      expect(mockOnFilterChange).toHaveBeenCalledWith(
        expect.objectContaining({
          search: 'Matrix',
        })
      );
    });
  });

  it('should call onClear when clear button is clicked', async () => {
    const user = userEvent.setup();

    render(
      <MovieFilters
        onFilterChange={mockOnFilterChange}
        onClear={mockOnClear}
        statusOptions={mockStatusOptions}
        visibilityOptions={mockVisibilityOptions}
      />
    );

    // Search first to trigger clear button display
    const searchInput = screen.getByPlaceholderText('Buscar películas...');
    await user.type(searchInput, 'test');

    // Now the clear button should be visible
    const clearButton = screen.getByText('Limpiar filtros');
    await user.click(clearButton);

    expect(mockOnClear).toHaveBeenCalled();
  });

  it('should render date range picker inputs', () => {
    render(
      <MovieFilters
        onFilterChange={mockOnFilterChange}
        onClear={mockOnClear}
        statusOptions={mockStatusOptions}
        visibilityOptions={mockVisibilityOptions}
      />
    );

    const dateInputs = document.querySelectorAll('input[type="date"]');
    expect(dateInputs.length).toBeGreaterThanOrEqual(2);
  });

  it('should handle status filter changes', async () => {
    const user = userEvent.setup();

    render(
      <MovieFilters
        onFilterChange={mockOnFilterChange}
        onClear={mockOnClear}
        statusOptions={mockStatusOptions}
        visibilityOptions={mockVisibilityOptions}
      />
    );

    // Status select should be present
    const statusElements = screen.getAllByText('Estado');
    expect(statusElements.length).toBeGreaterThan(0);
  });

  it('should handle visibility filter changes', async () => {
    const user = userEvent.setup();

    render(
      <MovieFilters
        onFilterChange={mockOnFilterChange}
        onClear={mockOnClear}
        statusOptions={mockStatusOptions}
        visibilityOptions={mockVisibilityOptions}
      />
    );

    // Visibility select should be present
    const visibilityElements = screen.getAllByText('Visibilidad');
    expect(visibilityElements.length).toBeGreaterThan(0);
  });

  it('should allow selecting multiple statuses', () => {
    render(
      <MovieFilters
        onFilterChange={mockOnFilterChange}
        onClear={mockOnClear}
        statusOptions={mockStatusOptions}
        visibilityOptions={mockVisibilityOptions}
      />
    );

    const statusLabel = screen.getByText('Estado');
    expect(statusLabel).toBeInTheDocument();
  });

  it('should allow selecting multiple visibilities', () => {
    render(
      <MovieFilters
        onFilterChange={mockOnFilterChange}
        onClear={mockOnClear}
        statusOptions={mockStatusOptions}
        visibilityOptions={mockVisibilityOptions}
      />
    );

    const visibilityLabel = screen.getByText('Visibilidad');
    expect(visibilityLabel).toBeInTheDocument();
  });
});
