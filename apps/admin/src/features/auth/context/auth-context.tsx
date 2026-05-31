'use client';

import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useGetUser } from '@/src/domain/auth/use-get-user';
import { isApiError } from '@/src/lib/errors';
import type { AuthContextValue } from '../types/auth.types';

const AuthContext = createContext<AuthContextValue | null>(null);

function hasSessionCookie(): boolean {
  if (typeof document === 'undefined') return false;
  return /(?:^|; )cinema_session=/.test(document.cookie);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [enabled, setEnabled] = useState(hasSessionCookie);

  const { data: user, isLoading, error } = useGetUser(enabled);

  useEffect(() => {
    if (isApiError(error) && error.status === 401) {
      setEnabled(false);
      router.push('/login');
    }
  }, [error, router]);

  const logout = useCallback(async () => {
    await fetch('/api/auth/session', { method: 'DELETE' });
    setEnabled(false);
    router.push('/login');
  }, [router]);

  return (
    <AuthContext.Provider value={{ user: user ?? null, isLoading, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuthContext must be used within AuthProvider');
  return ctx;
}
