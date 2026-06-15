import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Pagination } from './Pagination';

describe('Pagination', () => {
  it('should disable prev button on first page', () => {
    render(
      <Pagination currentPage={1} totalPages={5} onPageChange={vi.fn()} />
    );
    expect(screen.getByText('← Previous')).toBeDisabled();
  });

  it('should disable next button on last page', () => {
    render(
      <Pagination currentPage={5} totalPages={5} onPageChange={vi.fn()} />
    );
    expect(screen.getByText('Next →')).toBeDisabled();
  });

  it('should call onPageChange with correct page on prev click', () => {
    const onChange = vi.fn();
    render(
      <Pagination currentPage={3} totalPages={5} onPageChange={onChange} />
    );
    fireEvent.click(screen.getByText('← Previous'));
    expect(onChange).toHaveBeenCalledWith(2);
  });

  it('should call onPageChange with correct page on next click', () => {
    const onChange = vi.fn();
    render(
      <Pagination currentPage={2} totalPages={5} onPageChange={onChange} />
    );
    fireEvent.click(screen.getByText('Next →'));
    expect(onChange).toHaveBeenCalledWith(3);
  });

  it('should show page info', () => {
    render(
      <Pagination
        currentPage={2}
        totalPages={5}
        onPageChange={vi.fn()}
        showPageInfo={true}
      />
    );
    expect(screen.getByText('of 5')).toBeInTheDocument();
  });

  it('should allow jumping to page via input', () => {
    const onChange = vi.fn();
    render(
      <Pagination
        currentPage={1}
        totalPages={5}
        onPageChange={onChange}
        showPageInfo={true}
      />
    );
    const input = screen.getByDisplayValue('1') as HTMLInputElement;
    fireEvent.change(input, { target: { value: '3' } });
    fireEvent.blur(input);
    expect(onChange).toHaveBeenCalledWith(3);
  });
});
