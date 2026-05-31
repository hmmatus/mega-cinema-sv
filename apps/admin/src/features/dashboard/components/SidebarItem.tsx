'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { NavItem, NavIconName } from '../config/nav-items.config';

function NavIcon({ name }: { name: NavIconName }) {
  const cls = 'h-4 w-4 shrink-0';
  switch (name) {
    case 'dashboard':
      return (
        <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <rect x="3" y="3" width="7" height="7" rx="1" strokeWidth="1.5" />
          <rect x="14" y="3" width="7" height="7" rx="1" strokeWidth="1.5" />
          <rect x="14" y="14" width="7" height="7" rx="1" strokeWidth="1.5" />
          <rect x="3" y="14" width="7" height="7" rx="1" strokeWidth="1.5" />
        </svg>
      );
    case 'movies':
      return (
        <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <rect x="2" y="4" width="20" height="16" rx="2" strokeWidth="1.5" />
          <path d="M7 4v16M17 4v16M2 9h5M17 9h5M2 15h5M17 15h5" strokeWidth="1.5" />
        </svg>
      );
    case 'banners':
      return (
        <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <rect x="3" y="5" width="18" height="14" rx="2" strokeWidth="1.5" />
          <path d="M3 9h18" strokeWidth="1.5" />
        </svg>
      );
    case 'branches':
      return (
        <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            d="M12 2C8.69 2 6 4.69 6 8c0 5.25 6 13 6 13s6-7.75 6-13c0-3.31-2.69-6-6-6z"
            strokeWidth="1.5"
          />
          <circle cx="12" cy="8" r="2" strokeWidth="1.5" />
        </svg>
      );
    case 'schedule':
      return (
        <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <rect x="3" y="4" width="18" height="18" rx="2" strokeWidth="1.5" />
          <path d="M16 2v4M8 2v4M3 10h18" strokeWidth="1.5" />
        </svg>
      );
    case 'purchases':
      return (
        <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" strokeWidth="1.5" />
          <line x1="3" y1="6" x2="21" y2="6" strokeWidth="1.5" />
          <path d="M16 10a4 4 0 01-8 0" strokeWidth="1.5" />
        </svg>
      );
    case 'audit':
      return (
        <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            d="M12 2L4 6v6c0 5.55 3.84 10.74 8 12 4.16-1.26 8-6.45 8-12V6l-8-4z"
            strokeWidth="1.5"
          />
        </svg>
      );
    case 'qr':
      return (
        <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <rect x="3" y="3" width="7" height="7" rx="1" strokeWidth="1.5" />
          <rect x="14" y="3" width="7" height="7" rx="1" strokeWidth="1.5" />
          <rect x="3" y="14" width="7" height="7" rx="1" strokeWidth="1.5" />
          <path d="M14 14h3v3M17 17h4v4M14 21v-3" strokeWidth="1.5" />
        </svg>
      );
    case 'changes':
      return (
        <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <circle cx="12" cy="8" r="4" strokeWidth="1.5" />
          <path d="M4 20c0-4 3.58-7 8-7s8 3 8 7" strokeWidth="1.5" />
        </svg>
      );
  }
}

interface SidebarItemProps {
  item: NavItem;
}

export function SidebarItem({ item }: SidebarItemProps) {
  const pathname = usePathname();
  const isActive = pathname === item.href;

  return (
    <Link
      href={item.href}
      className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors ${
        isActive
          ? 'bg-blue-600 text-white'
          : 'text-gray-300 hover:bg-gray-700 hover:text-white'
      }`}
    >
      <NavIcon name={item.icon} />
      <span>{item.label}</span>
    </Link>
  );
}
