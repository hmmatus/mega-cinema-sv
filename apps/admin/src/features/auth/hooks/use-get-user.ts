'use client';

import { useQuery } from '@tanstack/react-query';
import { getUser } from '../api/auth.api';

export function useGetUser(enabled: boolean) {
  return useQuery({
    queryKey: ['user'],
    queryFn: getUser,
    enabled,
    retry: false,
  });
}
