'use client';

import { useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import type { TabValue } from './types';
import { TABS } from './constants';

export function useCategoryTabs() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const rawTab = searchParams.get('tab');
  const validValues = TABS.map((t) => t.value) as string[];
  const activeTab: TabValue = (validValues.includes(rawTab ?? '') ? rawTab : 'todos') as TabValue;

  const handleTabChange = useCallback(
    (value: TabValue) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set('tab', value);
      router.push(`/?${params.toString()}`);
    },
    [router, searchParams],
  );

  return { activeTab, handleTabChange, tabs: TABS };
}
