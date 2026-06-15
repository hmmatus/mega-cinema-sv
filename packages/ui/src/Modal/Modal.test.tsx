import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Modal } from './Modal';

describe('Modal', () => {
  it('should not render when isOpen is false', () => {
    const { container } = render(
      <Modal isOpen={false} title="Test Modal" onClose={vi.fn()}>
        <div>Content</div>
      </Modal>
    );
    expect(container.querySelector('[role="dialog"]')).not.toBeInTheDocument();
  });

  it('should render when isOpen is true', () => {
    render(
      <Modal isOpen={true} title="Test Modal" onClose={vi.fn()}>
        <div>Content</div>
      </Modal>
    );
    expect(screen.getByText('Test Modal')).toBeInTheDocument();
  });

  it('should call onClose when backdrop clicked', () => {
    const onClose = vi.fn();
    const { container } = render(
      <Modal isOpen={true} title="Test Modal" onClose={onClose}>
        <div>Content</div>
      </Modal>
    );
    const backdrop = container.querySelector('[data-testid="modal-backdrop"]');
    fireEvent.click(backdrop!);
    expect(onClose).toHaveBeenCalled();
  });

  it('should NOT call onClose when modal content clicked', () => {
    const onClose = vi.fn();
    render(
      <Modal isOpen={true} title="Test Modal" onClose={onClose}>
        <div data-testid="modal-content">Content</div>
      </Modal>
    );
    const content = screen.getByTestId('modal-content');
    fireEvent.click(content);
    expect(onClose).not.toHaveBeenCalled();
  });

  it('should render children inside modal', () => {
    render(
      <Modal isOpen={true} title="Test Modal" onClose={vi.fn()}>
        <div>Child Content</div>
      </Modal>
    );
    expect(screen.getByText('Child Content')).toBeInTheDocument();
  });

  it('should display title and description', () => {
    render(
      <Modal
        isOpen={true}
        title="Test Modal"
        description="Test description"
        onClose={vi.fn()}
      >
        <div>Content</div>
      </Modal>
    );
    expect(screen.getByText('Test Modal')).toBeInTheDocument();
    expect(screen.getByText('Test description')).toBeInTheDocument();
  });

  it('should apply size classes correctly', () => {
    const { container: smContainer } = render(
      <Modal isOpen={true} title="Test" size="sm" onClose={vi.fn()}>
        <div>Content</div>
      </Modal>
    );
    expect(smContainer.querySelector('[data-testid="modal-content"]')).toHaveClass('max-w-sm');
  });
});
