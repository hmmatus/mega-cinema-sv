import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Select } from './Select';

const options = [
  { value: 'apple', label: 'Apple' },
  { value: 'banana', label: 'Banana' },
  { value: 'cherry', label: 'Cherry', disabled: true },
];

describe('Select', () => {
  it('should render placeholder when no value', () => {
    render(<Select options={options} onChange={vi.fn()} />);
    expect(screen.getByText('Select an option')).toBeInTheDocument();
  });

  it('should display selected label', () => {
    render(<Select options={options} value="apple" onChange={vi.fn()} />);
    expect(screen.getByText('Apple')).toBeInTheDocument();
  });

  it('should open dropdown on click', () => {
    render(<Select options={options} onChange={vi.fn()} />);
    fireEvent.click(screen.getByText('Select an option'));
    expect(screen.getByText('Banana')).toBeInTheDocument();
  });

  it('should call onChange when option selected', () => {
    const onChange = vi.fn();
    render(<Select options={options} onChange={onChange} />);
    fireEvent.click(screen.getByText('Select an option'));
    fireEvent.click(screen.getByText('Apple'));
    expect(onChange).toHaveBeenCalledWith('apple');
  });

  it('should not allow selecting disabled option', () => {
    const onChange = vi.fn();
    render(<Select options={options} onChange={onChange} />);
    fireEvent.click(screen.getByText('Select an option'));
    fireEvent.click(screen.getByText('Cherry'));
    expect(onChange).not.toHaveBeenCalled();
  });

  it('should close dropdown after selection', () => {
    render(<Select options={options} onChange={vi.fn()} />);
    fireEvent.click(screen.getByText('Select an option'));
    fireEvent.click(screen.getByText('Apple'));
    expect(screen.queryByText('Banana')).not.toBeInTheDocument();
  });
});
