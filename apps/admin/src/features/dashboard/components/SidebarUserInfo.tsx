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
  const { user, isLoading, logout } = useAuth();

  return (
    <div className="border-t border-gray-700 px-3 py-4">
      {isLoading || !user ? (
        <div className="flex animate-pulse items-center gap-3">
          <div className="h-9 w-9 shrink-0 rounded-full bg-gray-700" />
          <div className="flex-1 space-y-1.5">
            <div className="h-3 w-24 rounded bg-gray-700" />
            <div className="h-2.5 w-16 rounded bg-gray-700" />
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-semibold text-white">
            {`${user.firstName[0]}${user.lastName[0]}`.toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-white">
              {`${user.firstName} ${user.lastName}`}
            </p>
            <p className="truncate text-xs text-gray-400">
              {ROLE_LABELS[user.role.name] ?? user.role.name.toUpperCase()}
            </p>
          </div>
          <button
            onClick={logout}
            title="Cerrar sesión"
            aria-label="Cerrar sesión"
            className="shrink-0 rounded-lg bg-white/10 p-1.5 text-gray-300 transition-colors hover:bg-white/20 hover:text-white"
          >
            <LogoutIcon />
          </button>
        </div>
      )}
    </div>
  );
}
