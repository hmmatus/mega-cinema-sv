---
name: domain-api
description: Scaffoldea la capa de datos de un dominio en apps/admin. Genera tipos TS, funciones de API (apiClient), keys factory, y hooks React Query. Usar cuando el usuario pida crear un endpoint/servicio/query/mutation para una feature del admin.
version: 2.0.0
source: local-repo-analysis
---

# Domain API Layer — apps/admin

Patrón de dos capas: **feature API** (funciones axios) + **domain hooks** (React Query).

## Cuándo aplicar

- "Implementa este endpoint en el admin"
- "Crea la query para listar X"
- "Agrega la mutation para crear/actualizar/eliminar X"

---

## Estructura de archivos

```
apps/admin/src/
  features/<feature>/
    api/
      <feature>.api.ts     — funciones fetch/mutation usando apiClient
    types/
      <feature>.types.ts   — interfaces TypeScript (sin Zod en este proyecto)
  domain/<feature>/
    <feature>.keys.ts      — factories de keys para React Query
    use-<entity>.ts        — hook useQuery (un archivo por query)
    use-<operation>.ts     — hook useMutation (un archivo por mutation)
```

**`<feature>`** = sustantivo en minúsculas, singular o plural según el dominio. Ej: `auth`, `movies`, `bookings`.

---

## Reglas clave

1. **`apiClient` siempre.** Importar desde `@/src/config/axios`. Nunca `fetch` directo ni nueva instancia de axios.
2. **Sin Zod.** Este proyecto usa interfaces TypeScript manuales — no agregar validación Zod en runtime.
3. **Funciones de API separadas de hooks.** Las funciones `fetchX`/`createX`/`updateX` viven en `features/<feature>/api/`. Los hooks React Query viven en `domain/<feature>/`.
4. **Keys split.** `<domain>QueryKeys` y `<domain>MutationKeys` como objetos separados en `<feature>.keys.ts`.
5. **Un archivo por hook.** `use-get-<entity>.ts` para queries, `use-<verb>-<entity>.ts` para mutations.
6. **Errores automáticos.** El interceptor de axios convierte non-2xx en `ApiError`. No wrappear en try/catch en las funciones de API.
7. **`mutationKey` obligatorio** en `useMutation` para debugging y deduplication.

---

## `features/<feature>/types/<feature>.types.ts`

Interfaces TypeScript puras — sin Zod, sin lógica.

```ts
// src/features/movies/types/movies.types.ts

export interface Movie {
  id: string;
  title: string;
  posterUrl: string;
  durationMin: number;
  releaseYear: number;
}

export interface MoviesListResponse {
  data: Movie[];
  total: number;
  page: number;
  pageSize: number;
}

export interface CreateMovieInput {
  title: string;
  posterUrl: string;
  durationMin: number;
  releaseYear: number;
}
```

---

## `features/<feature>/api/<feature>.api.ts`

Funciones nombradas que usan `apiClient`. Una función por operación.

```ts
// src/features/movies/api/movies.api.ts
import { apiClient } from '@/src/config/axios';
import type {
  Movie,
  MoviesListResponse,
  CreateMovieInput,
} from '../types/movies.types';

export async function getMovies(params?: {
  page?: number;
  pageSize?: number;
}): Promise<MoviesListResponse> {
  const res = await apiClient.get<MoviesListResponse>('/movies', { params });
  return res.data;
}

export async function getMovieById(id: string): Promise<Movie> {
  const res = await apiClient.get<Movie>(`/movies/${id}`);
  return res.data;
}

export async function createMovie(input: CreateMovieInput): Promise<Movie> {
  const res = await apiClient.post<Movie>('/movies', input);
  return res.data;
}

export async function updateMovie(
  id: string,
  input: Partial<CreateMovieInput>,
): Promise<Movie> {
  const res = await apiClient.patch<Movie>(`/movies/${id}`, input);
  return res.data;
}

export async function deleteMovie(id: string): Promise<void> {
  await apiClient.delete(`/movies/${id}`);
}
```

---

## `domain/<feature>/<feature>.keys.ts`

Keys factories separadas por queries y mutations.

```ts
// src/domain/movies/movies.keys.ts

export const moviesQueryKeys = {
  all: ['movies'] as const,
  list: (params?: Record<string, unknown>) =>
    [...moviesQueryKeys.all, 'list', params] as const,
  detail: (id: string) => [...moviesQueryKeys.all, 'detail', id] as const,
} as const;

export const moviesMutationKeys = {
  create: () => ['movies', 'create'] as const,
  update: () => ['movies', 'update'] as const,
  delete: () => ['movies', 'delete'] as const,
} as const;
```

---

## Hook — `useQuery`

```ts
// src/domain/movies/use-get-movies.ts
'use client';

import { useQuery } from '@tanstack/react-query';
import { getMovies } from '@/src/features/movies/api/movies.api';
import { moviesQueryKeys } from './movies.keys';

interface UseGetMoviesParams {
  page?: number;
  pageSize?: number;
  enabled?: boolean;
}

export function useGetMovies({ page, pageSize, enabled = true }: UseGetMoviesParams = {}) {
  return useQuery({
    queryKey: moviesQueryKeys.list({ page, pageSize }),
    queryFn: () => getMovies({ page, pageSize }),
    enabled,
  });
}
```

---

## Hook — `useQuery` con param requerido

```ts
// src/domain/movies/use-get-movie.ts
'use client';

import { useQuery } from '@tanstack/react-query';
import { getMovieById } from '@/src/features/movies/api/movies.api';
import { moviesQueryKeys } from './movies.keys';

export function useGetMovie(id: string) {
  return useQuery({
    queryKey: moviesQueryKeys.detail(id),
    queryFn: () => getMovieById(id),
    enabled: Boolean(id),
  });
}
```

---

## Hook — `useMutation`

```ts
// src/domain/movies/use-create-movie.ts
'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createMovie } from '@/src/features/movies/api/movies.api';
import { moviesQueryKeys, moviesMutationKeys } from './movies.keys';

export function useCreateMovie() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: moviesMutationKeys.create(),
    mutationFn: createMovie,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: moviesQueryKeys.all });
    },
  });
}
```

---

## Uso del hook en viewmodel

```ts
// src/features/movies/components/MovieList/MovieList.viewmodel.ts
'use client';

import { useGetMovies } from '@/src/domain/movies/use-get-movies';
import { useAuth } from '@/src/features/auth/hooks/use-auth';

export function useMovieList() {
  const { user } = useAuth();
  const { data, isLoading, error } = useGetMovies();

  return {
    movies: data?.data ?? [],
    total: data?.total ?? 0,
    isLoading,
    error,
    isAdmin: user?.role.name === 'admin',
  };
}
```

---

## Auth-aware components

Para componentes que necesitan el usuario actual:

```ts
import { useAuth } from '@/src/features/auth/hooks/use-auth';

const { user, isLoading, logout } = useAuth();
// user: AuthUser | null
// isLoading: boolean (while getUser query runs)
// logout: () => Promise<void>
```

`useAuth()` sólo funciona dentro de `AuthProvider` (dashboard layout). No usar en páginas de auth.

---

## Manejo de errores

El interceptor de axios (`src/config/axios/index.ts`) convierte automáticamente non-2xx en `ApiError`. Las funciones en `*.api.ts` no necesitan try/catch.

En componentes, detectar errores de auth:

```ts
import { isApiError } from '@/src/lib/errors';

useEffect(() => {
  if (isApiError(error) && error.status === 401) {
    router.push('/login');
  }
}, [error, router]);
```

---

## Checklist de ejecución

- [ ] Crear `src/features/<feature>/types/<feature>.types.ts` con interfaces TS
- [ ] Crear `src/features/<feature>/api/<feature>.api.ts` — funciones nombradas con `apiClient`
- [ ] Crear `src/domain/<feature>/<feature>.keys.ts` — `<domain>QueryKeys` y `<domain>MutationKeys`
- [ ] Para cada GET → `src/domain/<feature>/use-get-<entity>.ts` con `useQuery`
- [ ] Para cada GET con id requerido → `enabled: Boolean(id)`
- [ ] Para cada POST/PATCH/DELETE → `src/domain/<feature>/use-<verb>-<entity>.ts` con `useMutation`
- [ ] Mutations con `onSuccess` invalidan queries relacionadas via `queryClient.invalidateQueries`
- [ ] Verificar: axios importado de `@/src/config/axios`, no `fetch` directo
- [ ] Verificar: no hay try/catch en funciones de API (interceptor lo maneja)
