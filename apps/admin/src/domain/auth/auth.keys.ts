export const authQueryKeys = {
  all: ['auth'] as const,
  user: () => [...authQueryKeys.all, 'user'] as const,
} as const;

export const authMutationKeys = {
  login: () => ['auth', 'login'] as const,
} as const;
