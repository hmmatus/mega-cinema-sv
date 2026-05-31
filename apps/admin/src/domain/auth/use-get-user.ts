'use client';

import { useQuery } from '@tanstack/react-query';
import { getUser } from '@/src/features/auth/api/auth.api';
import { authQueryKeys } from './auth.keys';

export function useGetUser(enabled: boolean) {
  return useQuery({
    queryKey: authQueryKeys.user(),
    queryFn: getUser,
    enabled,
    retry: false,
  });
}
