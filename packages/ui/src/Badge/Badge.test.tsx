import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Badge } from './Badge';

describe('Badge', () => {
  it('should render children text', () => {
    render(<Badge>Test Badge</Badge>);
    expect(screen.getByText('Test Badge')).toBeInTheDocument();
  });

  it('should apply default variant', () => {
    const { container } = render(<Badge>Test</Badge>);
    expect(container.querySelector('span')).toHaveClass('bg-gray-200');
  });

  it('should apply success variant', () => {
    const { container } = render(<Badge variant="success">Success</Badge>);
    expect(container.querySelector('span')).toHaveClass('bg-green-200');
  });

  it('should apply error variant', () => {
    const { container } = render(<Badge variant="error">Error</Badge>);
    expect(container.querySelector('span')).toHaveClass('bg-red-200');
  });

  it('should apply size classes', () => {
    const { container: smContainer } = render(<Badge size="sm">Small</Badge>);
    expect(smContainer.querySelector('span')).toHaveClass('text-xs');

    const { container: lgContainer } = render(<Badge size="lg">Large</Badge>);
    expect(lgContainer.querySelector('span')).toHaveClass('text-base');
  });
});
