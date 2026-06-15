import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { DatePicker } from './DatePicker';

describe('DatePicker', () => {
  it('should render calendar', () => {
    render(<DatePicker onChange={vi.fn()} />);
    expect(screen.getByText(/Su/)).toBeInTheDocument();
  });

  it('should select a date', () => {
    const onChange = vi.fn();
    render(<DatePicker onChange={onChange} />);
    const dayButton = screen.getByText('15');
    fireEvent.click(dayButton);
    expect(onChange).toHaveBeenCalled();
  });

  it('should disable dates before minDate', () => {
    const minDate = new Date(2026, 5, 15);
    render(<DatePicker onChange={vi.fn()} minDate={minDate} />);
    const dayButton = screen.getByText('10');
    expect(dayButton).toBeDisabled();
  });

  it('should display selected date in input', () => {
    const date = new Date(2026, 5, 15);
    render(<DatePicker onChange={vi.fn()} value={date} />);
    expect(screen.getByDisplayValue(/06\/15\/2026/)).toBeInTheDocument();
  });

  it('should navigate months', () => {
    render(<DatePicker onChange={vi.fn()} />);
    const nextButton = screen.getByText('▶');
    fireEvent.click(nextButton);
    expect(screen.getByText(/July/)).toBeInTheDocument();
  });
});
