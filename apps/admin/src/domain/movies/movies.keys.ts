import type { GetMoviesParams } from './movies.schema';

export const moviesQueryKeys = {
  all: ['movies'] as const,
  lists: () => [...moviesQueryKeys.all, 'list'] as const,
  list: (params: Partial<GetMoviesParams>) =>
    [...moviesQueryKeys.lists(), params] as const,
  details: () => [...moviesQueryKeys.all, 'detail'] as const,
  detail: (id: string) => [...moviesQueryKeys.details(), id] as const,
} as const;

export const moviesMutationKeys = {
  create: () => ['movies', 'create'] as const,
  update: (id: string) => ['movies', 'update', id] as const,
  delete: (id: string) => ['movies', 'delete', id] as const,
} as const;
