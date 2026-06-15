'use client';

import { useCategoryTabs } from './CategoryTabs.viewmodel';
import type { CategoryTabsProps } from './types';

export function CategoryTabs({ activeTab: initialActiveTab }: CategoryTabsProps) {
  const { activeTab, handleTabChange, tabs } = useCategoryTabs();

  const currentTab = activeTab ?? initialActiveTab;

  return (
    <div className="flex items-center gap-1 flex-wrap">
      {tabs.map((tab) => {
        const isActive = currentTab === tab.value;
        return (
          <button
            key={tab.value}
            onClick={() => handleTabChange(tab.value)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              isActive
                ? 'bg-[#0047AB] text-white'
                : 'text-[#64748B] hover:text-[#334155] hover:bg-[#F1F5F9]'
            }`}
          >
            {tab.label}
          </button>
        );
      })}
      <button
        disabled
        className="px-4 py-1.5 rounded-full text-sm font-medium text-[#94A3B8] cursor-not-allowed ml-2"
      >
        Más filtros
      </button>
    </div>
  );
}
