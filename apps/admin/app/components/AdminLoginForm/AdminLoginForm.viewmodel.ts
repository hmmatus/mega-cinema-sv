'use client';
import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useLogin } from '@/src/domain/auth/use-login';
import type { AdminLoginFormProps } from './types';
import { ERROR_MESSAGES } from './constants';

export function useAdminLoginForm({ redirectTo = '/' }: AdminLoginFormProps) {
  const router = useRouter();
  const loginMutation = useLogin();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError('');

      try {
        const result = await loginMutation.mutateAsync({ email, password });

        // Persist session: httpOnly cookie (middleware guard) + readable cookie (Bearer auth)
        const sessionRes = await fetch('/api/auth/session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ accessToken: result.accessToken }),
        });
        if (!sessionRes.ok) {
          throw new Error(ERROR_MESSAGES.connectionError);
        }

        router.push(redirectTo);
      } catch (err) {
        setError(err instanceof Error ? err.message : ERROR_MESSAGES.connectionError);
      }
    },
    [email, password, redirectTo, router, loginMutation],
  );

  return {
    email,
    setEmail,
    password,
    setPassword,
    showPassword,
    toggleShowPassword: () => setShowPassword((v) => !v),
    error,
    isLoading: loginMutation.isPending,
    handleSubmit,
  };
}
