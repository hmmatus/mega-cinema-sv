import type { TABS } from './constants';

export type TabValue = (typeof TABS)[number]['value'];

export interface CategoryTabsProps {
  activeTab: TabValue;
}
