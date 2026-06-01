'use client';

import { useMutation } from '@tanstack/react-query';
import { login } from '@/src/features/auth/api/auth.api';
import { authMutationKeys } from './auth.keys';

export function useLogin() {
  return useMutation({
    mutationKey: authMutationKeys.login(),
    mutationFn: login,
  });
}
