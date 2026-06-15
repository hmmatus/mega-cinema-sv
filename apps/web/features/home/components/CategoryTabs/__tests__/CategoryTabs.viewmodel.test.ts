import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useCategoryTabs } from '../CategoryTabs.viewmodel';

const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
  useSearchParams: () => new URLSearchParams(''),
}));

describe('useCategoryTabs', () => {
  it('defaults activeTab to "todos" when no searchParam', () => {
    const { result } = renderHook(() => useCategoryTabs());
    expect(result.current.activeTab).toBe('todos');
  });

  it('handleTabChange calls router.push with correct URL', () => {
    const { result } = renderHook(() => useCategoryTabs());
    act(() => {
      result.current.handleTabChange('preventa');
    });
    expect(mockPush).toHaveBeenCalledWith('/?tab=preventa');
  });

  it('exposes all 5 tabs', () => {
    const { result } = renderHook(() => useCategoryTabs());
    expect(result.current.tabs).toHaveLength(5);
  });
});
