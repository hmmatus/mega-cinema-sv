---
name: domain-api
description: Scaffoldea la capa de datos de un dominio a partir de un spec OpenAPI. Usar cuando el usuario proporcione un spec OpenAPI (o fragmento) con información de endpoints. Genera: schemas Zod (response + input siempre), query/mutation hooks con TanStack Query, fetch/mutation fns separadas, y keys de query. NO ejecutar sin spec OpenAPI.
version: 1.0.0
---

# Domain API Layer

Scaffoldea la capa de datos siguiendo el patrón: Zod schemas → types → TanStack Query hooks → axios.

## Cuándo aplicar

**Requisito obligatorio:** el usuario debe proporcionar un spec OpenAPI (JSON o YAML) o un fragmento de él con la definición del endpoint. Sin spec, detener y pedirlo.

Casos de uso:
- "Implementa este endpoint" + spec OpenAPI
- "Crea el servicio para esta API" + spec OpenAPI
- "Agrega la query para este endpoint" + spec OpenAPI

---

## Estructura de carpetas

```
src/domains/<entity_domain>/
  types/
    index.ts              — interfaces TS (inferidas de Zod o escritas a mano)
  schemas/                — SOLO si hay validación en runtime
    index.ts              — schemas Zod + tipos inferidos
  consts/
    keys.ts               — factories de keys para TanStack Query
  services/
    queries/
      use<Domain>Query.ts         — hook con useQuery o useInfiniteQuery
    mutations/
      use<Domain>Mutation.ts      — hook con useMutation
```

**`<entity_domain>`** = sustantivo en minúsculas, plural, en inglés. Ej: `movies`, `users`, `bookings`.

---

## Reglas clave

1. **Spec primero.** Leer el spec antes de escribir cualquier archivo. Extraer: método HTTP, path, params, request body, response body.
2. **Zod siempre.** Todo response se valida con Zod `.parse()`. Los tipos viven inferidos en `schemas/index.ts` — nunca crear `types/` por separado.
3. **`queryFn` separada.** La función de fetch se extrae como función nombrada (`fetch<Domain>`) fuera del hook. El hook solo la referencia. Permite reutilización y testing aislado.
4. **`mutationFn` separada.** Igual que queryFn — función nombrada (`create<Domain>`, `update<Domain>`, etc.) fuera del hook.
5. **Keys factory** siempre en `consts/keys.ts`.
6. **Nombre de hooks:** `use<Domain><Operación>Query` o `use<Domain><Operación>Mutation`. Ej: `useMoviesQuery`, `useMovieDetailQuery`, `useCreateMovieMutation`.
7. **Paginación:** si el endpoint tiene `page`, `cursor`, `offset` → usar `useInfiniteQuery`. Si no → `useQuery`.
8. **Axios:** importar instancia compartida desde `src/lib/axios.ts`. No crear nuevas instancias dentro del hook.

---

## `schemas/index.ts`

Siempre. Tanto para responses como para inputs. Los tipos viven inferidos aquí — **nunca crear `types/`**.

```ts
// src/domains/movies/schemas/index.ts
import { z } from 'zod'

export const movieSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1),
  posterUrl: z.string().url(),
  rating: z.number().min(0).max(10),
  releaseYear: z.number().int().min(1888),
})

export const moviesListResponseSchema = z.object({
  data: z.array(movieSchema),
  total: z.number().int(),
  page: z.number().int(),
  pageSize: z.number().int(),
})

export const movieDetailResponseSchema = z.object({
  data: movieSchema,
})

export const createMovieInputSchema = z.object({
  title: z.string().min(1, 'Título requerido'),
  posterUrl: z.string().url('URL inválida'),
  rating: z.number().min(0).max(10),
  releaseYear: z.number().int().min(1888),
})

// Tipos inferidos — nunca duplicar con interfaces manuales
export type Movie = z.infer<typeof movieSchema>
export type MoviesListResponse = z.infer<typeof moviesListResponseSchema>
export type MovieDetailResponse = z.infer<typeof movieDetailResponseSchema>
export type CreateMovieInput = z.infer<typeof createMovieInputSchema>
```

---

## `consts/keys.ts`

```ts
// src/domains/movies/consts/keys.ts

export const moviesKeys = {
  all: ['movies'] as const,
  lists: () => [...moviesKeys.all, 'list'] as const,
  list: (params: Record<string, unknown>) => [...moviesKeys.lists(), params] as const,
  details: () => [...moviesKeys.all, 'detail'] as const,
  detail: (id: string) => [...moviesKeys.details(), id] as const,
}
```

Patrón de naming: `<domain>Keys` en camelCase.

---

## Query hook — `useQuery`

La función de fetch vive **fuera** del hook como función nombrada. El hook solo la referencia.

```ts
// src/domains/movies/services/queries/useMoviesQuery.ts
import { useQuery } from '@tanstack/react-query'
import axios from '@/lib/axios'
import { moviesListResponseSchema, type MoviesListResponse } from '../../schemas'
import { moviesKeys } from '../../consts/keys'

interface UseMoviesQueryParams {
  page?: number
  pageSize?: number
}

async function fetchMovies(params: UseMoviesQueryParams): Promise<MoviesListResponse> {
  const { data } = await axios.get('/movies', { params })
  return moviesListResponseSchema.parse(data)
}

export function useMoviesQuery(params: UseMoviesQueryParams = {}) {
  return useQuery({
    queryKey: moviesKeys.list(params),
    queryFn: () => fetchMovies(params),
  })
}
```

---

## Query hook — `useInfiniteQuery` (cuando hay paginación)

```ts
// src/domains/movies/services/queries/useMoviesInfiniteQuery.ts
import { useInfiniteQuery } from '@tanstack/react-query'
import axios from '@/lib/axios'
import { moviesListResponseSchema, type MoviesListResponse } from '../../schemas'
import { moviesKeys } from '../../consts/keys'

async function fetchMoviesPage(page: number): Promise<MoviesListResponse> {
  const { data } = await axios.get('/movies', { params: { page, pageSize: 20 } })
  return moviesListResponseSchema.parse(data)
}

export function useMoviesInfiniteQuery() {
  return useInfiniteQuery({
    queryKey: moviesKeys.lists(),
    queryFn: ({ pageParam = 1 }) => fetchMoviesPage(pageParam as number),
    getNextPageParam: (lastPage) => {
      const hasMore = lastPage.page * lastPage.pageSize < lastPage.total
      return hasMore ? lastPage.page + 1 : undefined
    },
    initialPageParam: 1,
  })
}
```

---

## Detail query hook

```ts
// src/domains/movies/services/queries/useMovieDetailQuery.ts
import { useQuery } from '@tanstack/react-query'
import axios from '@/lib/axios'
import { movieDetailResponseSchema, type MovieDetailResponse } from '../../schemas'
import { moviesKeys } from '../../consts/keys'

async function fetchMovieDetail(id: string): Promise<MovieDetailResponse> {
  const { data } = await axios.get(`/movies/${id}`)
  return movieDetailResponseSchema.parse(data)
}

export function useMovieDetailQuery(id: string) {
  return useQuery({
    queryKey: moviesKeys.detail(id),
    queryFn: () => fetchMovieDetail(id),
    enabled: Boolean(id),
  })
}
```

---

## Mutation hook

La función de mutación también vive fuera del hook. Response siempre validada con Zod.

```ts
// src/domains/movies/services/mutations/useCreateMovieMutation.ts
import { useMutation, useQueryClient } from '@tanstack/react-query'
import axios from '@/lib/axios'
import {
  createMovieInputSchema,
  movieDetailResponseSchema,
  type CreateMovieInput,
  type MovieDetailResponse,
} from '../../schemas'
import { moviesKeys } from '../../consts/keys'

async function createMovie(input: CreateMovieInput): Promise<MovieDetailResponse> {
  const validated = createMovieInputSchema.parse(input)
  const { data } = await axios.post('/movies', validated)
  return movieDetailResponseSchema.parse(data)
}

export function useCreateMovieMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createMovie,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: moviesKeys.lists() })
    },
  })
}
```

---

## Ejemplo completo leído desde OpenAPI

**Spec fragmento:**
```yaml
/movies:
  get:
    summary: List movies
    parameters:
      - name: page
        in: query
        schema: { type: integer }
      - name: pageSize
        in: query
        schema: { type: integer }
    responses:
      200:
        content:
          application/json:
            schema:
              type: object
              properties:
                data:
                  type: array
                  items:
                    $ref: '#/components/schemas/Movie'
                total: { type: integer }
                page: { type: integer }
                pageSize: { type: integer }
  post:
    summary: Create movie
    requestBody:
      content:
        application/json:
          schema: { $ref: '#/components/schemas/CreateMovieInput' }
    responses:
      201:
        content:
          application/json:
            schema: { $ref: '#/components/schemas/Movie' }
```

**Decisiones tomadas:**
- `GET /movies` tiene `page` → `useInfiniteQuery` ✓
- `POST /movies` → mutation ✓
- `schemas/index.ts` con Zod para response y request body ✓
- `fetchMovies`, `fetchMovieDetail`, `createMovie` como funciones nombradas fuera del hook ✓
- Response validada con `.parse()` en cada fetch/mutation fn ✓

---

## Checklist de ejecución (en orden)

- [ ] Leer spec OpenAPI completo del endpoint — si no existe, DETENER y pedirlo
- [ ] Identificar: entidad, método HTTP, path, params, request body, response body
- [ ] Crear `schemas/index.ts` — schemas Zod para response y request body + tipos inferidos (nunca `types/`)
- [ ] Crear `consts/keys.ts` con factory `<domain>Keys`
- [ ] Para cada GET sin paginación → función `fetch<Domain>` + `useQuery` hook en `services/queries/`
- [ ] Para cada GET con paginación (page/cursor/offset) → función `fetch<Domain>Page` + `useInfiniteQuery` hook
- [ ] Para cada POST/PUT/PATCH/DELETE → función nombrada (`create<Domain>`, `update<Domain>`) + `useMutation` hook en `services/mutations/`
- [ ] Cada función de fetch/mutation valida response con `<schema>.parse(data)`
- [ ] Funciones de fetch/mutation exportadas fuera del hook — `queryFn`/`mutationFn` referencia la función, no define arrow inline
- [ ] Nombrar hooks: `use<Domain><Operación>Query` / `use<Domain><Operación>Mutation`
- [ ] Verificar que axios se importe de `src/lib/axios.ts`, no como nueva instancia
- [ ] `onSuccess` en mutations invalida queries afectadas via `queryClient.invalidateQueries`
