'use client';

import { useAuth } from '@/src/features/auth/hooks/use-auth';

const ROLE_LABELS: Record<string, string> = {
  admin: 'ADMINISTRADOR',
  employee: 'EMPLEADO',
};

function LogoutIcon() {
  return (
    <svg
      className="h-4 w-4"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      aria-hidden="true"
    >
      <path
        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function SidebarUserInfo() {
  const { user, logout } = useAuth();

  if (!user) return null;

  const initials = `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
  const displayName = `${user.firstName} ${user.lastName}`;
  const roleLabel = ROLE_LABELS[user.role.name] ?? user.role.name.toUpperCase();

  return (
    <div className="border-t border-gray-700 px-3 py-4">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-semibold text-white">
          {initials}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-white">{displayName}</p>
          <p className="truncate text-xs text-gray-400">{roleLabel}</p>
        </div>
        <button
          onClick={logout}
          title="Cerrar sesión"
          aria-label="Cerrar sesión"
          className="shrink-0 text-gray-400 transition-colors hover:text-white"
        >
          <LogoutIcon />
        </button>
      </div>
    </div>
  );
}
