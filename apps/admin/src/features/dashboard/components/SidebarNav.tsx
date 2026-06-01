'use client';

import { useAuth } from '@/src/features/auth/hooks/use-auth';
import { ADMIN_NAV, EMPLOYEE_NAV } from '../config/nav-items.config';
import { SidebarItem } from './SidebarItem';

export function SidebarNav() {
  const { user } = useAuth();
  if (!user) return null;
  const items = user.role.name === 'admin' ? ADMIN_NAV : EMPLOYEE_NAV;

  return (
    <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 py-4">
      {items.map((item) => (
        <SidebarItem key={`${item.href}-${item.label}`} item={item} />
      ))}
    </nav>
  );
}
