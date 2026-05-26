'use client';
import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import type { AdminLoginFormProps, LoginStatus } from './types';
import { ERROR_MESSAGES, ALLOWED_ROLES } from './constants';

let _supabaseClient: ReturnType<typeof createClient> | null = null;

function getSupabase() {
  if (!_supabaseClient) {
    _supabaseClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    );
  }
  return _supabaseClient;
}

export function useAdminLoginForm({ redirectTo = '/' }: AdminLoginFormProps) {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [keepSession, setKeepSession] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [status, setStatus] = useState<LoginStatus>('idle');

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError('');
      setStatus('loading');

      try {
        const { data, error: authError } = await getSupabase().auth.signInWithPassword({
          email,
          password,
        });

        if (authError || !data.user) {
          setError(ERROR_MESSAGES.invalidCredentials);
          setStatus('error');
          return;
        }

        const role = data.user.app_metadata?.role as string | undefined;
        if (!role || !(ALLOWED_ROLES as ReadonlyArray<string>).includes(role)) {
          await getSupabase().auth.signOut();
          setError(ERROR_MESSAGES.noRole);
          setStatus('error');
          return;
        }

        router.push(redirectTo);
      } catch {
        setError(ERROR_MESSAGES.connectionError);
        setStatus('error');
      }
    },
    [email, password, redirectTo, router],
  );

  return {
    email,
    setEmail,
    password,
    setPassword,
    keepSession,
    setKeepSession,
    showPassword,
    toggleShowPassword: () => setShowPassword((v) => !v),
    error,
    isLoading: status === 'loading',
    handleSubmit,
  };
}
