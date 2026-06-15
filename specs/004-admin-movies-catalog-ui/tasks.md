---
feature: Admin Movies Catalog UI
spec: specs/004-admin-movies-catalog-ui/spec.md
plan: specs/004-admin-movies-catalog-ui/plan.md
status: pending
created: 2026-06-14
---

# Tasks: Admin Movies Catalog UI

## Progreso

0 / 35 completadas

---

## Fase 0 — Fundación

> API endpoints GET/POST/PUT/DELETE `/api/movies` ya existen (spec 003). No hay cambios de schema.

- [x] T-000: API endpoints disponibles (spec 003)
- [ ] T-001: Verificar tipos de Movie en `@cinema/shared` o `@cinema/database`

---

## Fase 1 — Base Components (`@cinema/ui`) [P]

> Componentes reutilizables. Paralelizable. Escribir test primero (TDD).

### Modal Component
- [ ] T-010: Create folder `packages/ui/src/Modal/` [depende: T-001]
- [ ] T-011 [P]: Write `Modal.test.tsx` with test contract [depende: T-010]
- [ ] T-012 [P]: Use `/mvvm-component` skill for Modal scaffold [depende: T-011]
- [ ] T-013 [P]: Implement `Modal.tsx` + `Modal.viewmodel.ts` to pass tests [depende: T-012]
- [ ] T-014 [P]: Write `Modal/types.ts` and `Modal/index.ts` [depende: T-013]

### Table Component
- [ ] T-020: Create folder `packages/ui/src/Table/` [depende: T-001]
- [ ] T-021 [P]: Write `Table.test.tsx` with test contract [depende: T-020]
- [ ] T-022 [P]: Use `/mvvm-component` skill for Table scaffold [depende: T-021]
- [ ] T-023 [P]: Implement `Table.tsx` + `Table.viewmodel.ts` [depende: T-022]
- [ ] T-024 [P]: Write `Table/types.ts` and `Table/index.ts` [depende: T-023]

### Select Component
- [ ] T-030: Create folder `packages/ui/src/Select/` [depende: T-001]
- [ ] T-031 [P]: Write `Select.test.tsx` [depende: T-030]
- [ ] T-032 [P]: Use `/mvvm-component` skill for Select [depende: T-031]
- [ ] T-033 [P]: Implement `Select.tsx` + `Select.viewmodel.ts` [depende: T-032]
- [ ] T-034 [P]: Write `Select/types.ts` and `Select/index.ts` [depende: T-033]

### DatePicker Component
- [ ] T-040: Create folder `packages/ui/src/DatePicker/` [depende: T-001]
- [ ] T-041 [P]: Write `DatePicker.test.tsx` + `DateRangePicker.test.tsx` [depende: T-040]
- [ ] T-042 [P]: Use `/mvvm-component` skill for DatePicker [depende: T-041]
- [ ] T-043 [P]: Implement `DatePicker.tsx` + `DateRangePicker.tsx` [depende: T-042]
- [ ] T-044 [P]: Write `DatePicker/types.ts` and `DatePicker/index.ts` [depende: T-043]

### Badge Component
- [ ] T-050: Create folder `packages/ui/src/Badge/` [depende: T-001]
- [ ] T-051 [P]: Write `Badge.test.tsx` [depende: T-050]
- [ ] T-052 [P]: Use `/mvvm-component` skill for Badge [depende: T-051]
- [ ] T-053 [P]: Implement `Badge.tsx` [depende: T-052]
- [ ] T-054 [P]: Write `Badge/types.ts` and `Badge/index.ts` [depende: T-053]

### Pagination Component
- [ ] T-060: Create folder `packages/ui/src/Pagination/` [depende: T-001]
- [ ] T-061 [P]: Write `Pagination.test.tsx` [depende: T-060]
- [ ] T-062 [P]: Use `/mvvm-component` skill for Pagination [depende: T-061]
- [ ] T-063 [P]: Implement `Pagination.tsx` [depende: T-062]
- [ ] T-064 [P]: Write `Pagination/types.ts` and `Pagination/index.ts` [depende: T-063]

### Export from @cinema/ui
- [ ] T-070: Update `packages/ui/src/index.ts` to export all 6 components [depende: T-014, T-024, T-034, T-044, T-054, T-064]

---

## Fase 2 — Frontend Data Layer (`apps/admin/src/domain/movies`) [P]

> Schemas, keys, hooks. Follow auth domain pattern. Paralelizable con Fase 1 (sin dependencias de componentes).

### Schemas & Types (Domain)
- [ ] T-100 [P]: Create `apps/admin/src/domain/movies/movies.schema.ts` — Zod schemas (Movie, CreateMovieDTO, UpdateMovieDTO) [depende: T-001]
- [ ] T-101 [P]: Create `apps/admin/src/domain/movies/movies.types.ts` — request/response types [depende: T-100]
- [ ] T-102 [P]: Write tests for `movies.schema.ts` [depende: T-100]

### API Layer (Features)
- [ ] T-110 [P]: Create `apps/admin/src/features/movies/api/movies.api.ts` — fetch functions (getMovies, createMovie, updateMovie, deleteMovie) [depende: T-100]
- [ ] T-111 [P]: Write tests for `movies.api.ts` — mock API, test Zod validation [depende: T-110]

### TanStack Query Setup (Domain)
- [ ] T-120 [P]: Create `apps/admin/src/domain/movies/movies.keys.ts` — query key factory [depende: T-100]
- [ ] T-121 [P]: Create `apps/admin/src/domain/movies/use-movies-list.ts` — query hook with filters, pagination, search [depende: T-110, T-120]
- [ ] T-122 [P]: Write tests for `use-movies-list.ts` [depende: T-121]
- [ ] T-123 [P]: Create `apps/admin/src/domain/movies/use-movie-form.ts` — mutation hooks (create, update, delete) [depende: T-110, T-120]
- [ ] T-124 [P]: Write tests for `use-movie-form.ts` [depende: T-123]
- [ ] T-125 [P]: Create `apps/admin/src/domain/movies/use-movie-details.ts` — query hook for single movie [depende: T-110, T-120]
- [ ] T-126 [P]: Write tests for `use-movie-details.ts` [depende: T-125]

---

## Fase 3 — Feature Components (`apps/admin/features/movies`) [P]

> Paralelizable dentro de la fase. Depende de Fase 2 (hooks/schemas listos).

### MoviesList Component
- [ ] T-200: Create folder `apps/admin/src/features/movies/components/MoviesList/` [depende: T-070, T-122]
- [ ] T-201 [P]: Write `MoviesList.test.tsx` with component test contract [depende: T-200]
- [ ] T-202 [P]: Use `/mvvm-component` skill for MoviesList [depende: T-201]
- [ ] T-203 [P]: Implement `MoviesList.tsx` — renders Table with movie data [depende: T-202]
- [ ] T-204 [P]: Implement `MoviesList.viewmodel.ts` — integrates use-movies-list hook from domain [depende: T-203, T-121]
- [ ] T-205 [P]: Write `MoviesList/types.ts` and `MoviesList/index.ts` [depende: T-204]

### MovieForm Component
- [ ] T-210: Create folder `apps/admin/src/features/movies/components/MovieForm/` [depende: T-070, T-124]
- [ ] T-211 [P]: Write `MovieForm.test.tsx` with form test contract [depende: T-210]
- [ ] T-212 [P]: Use `/mvvm-component` skill for MovieForm [depende: T-211]
- [ ] T-213 [P]: Implement `MovieForm.tsx` — form inputs, validation errors [depende: T-212]
- [ ] T-214 [P]: Implement `MovieForm.viewmodel.ts` — integrates use-movie-form hook from domain [depende: T-213, T-123]
- [ ] T-215 [P]: Write `MovieForm/types.ts` and `MovieForm/index.ts` [depende: T-214]

### MovieFilters Component
- [ ] T-220: Create folder `apps/admin/src/features/movies/components/MovieFilters/` [depende: T-070, T-122]
- [ ] T-221 [P]: Write `MovieFilters.test.tsx` [depende: T-220]
- [ ] T-222 [P]: Use `/mvvm-component` skill for MovieFilters [depende: T-221]
- [ ] T-223 [P]: Implement `MovieFilters.tsx` — search input, status select, visibility select, date range [depende: T-222]
- [ ] T-224 [P]: Implement `MovieFilters.viewmodel.ts` — integrates use-movies-list hook [depende: T-223, T-121]
- [ ] T-225 [P]: Write `MovieFilters/types.ts` and `MovieFilters/index.ts` [depende: T-224]

### MovieDetails Component
- [ ] T-230: Create folder `apps/admin/src/features/movies/components/MovieDetails/` [depende: T-070, T-126]
- [ ] T-231 [P]: Write `MovieDetails.test.tsx` [depende: T-230]
- [ ] T-232 [P]: Use `/mvvm-component` skill for MovieDetails [depende: T-231]
- [ ] T-233 [P]: Implement `MovieDetails.tsx` — display movie info, edit/delete/archive buttons [depende: T-232]
- [ ] T-234 [P]: Implement `MovieDetails.viewmodel.ts` — integrates use-movie-details hook from domain [depende: T-233, T-125]
- [ ] T-235 [P]: Write `MovieDetails/types.ts` and `MovieDetails/index.ts` [depende: T-234]

---

## Fase 4 — Pages & Routes [sequence]

> Depende de Fase 3 (componentes listos).

- [ ] T-300: Create `/admin/movies/page.tsx` — movies list layout [depende: T-205, T-225]
- [ ] T-301: Create `/admin/movies/[id]/page.tsx` — detail view [depende: T-235]
- [ ] T-302: Create `/admin/movies/[id]/edit/page.tsx` — edit form page [depende: T-215]
- [ ] T-303: Create `/admin/movies/new/page.tsx` — create form page [depende: T-215]
- [ ] T-304: Update sidebar navigation — add Movies link in `apps/admin/src/features/dashboard/config/nav-items.config.ts` [depende: T-300]

---

## Fase 5 — E2E Tests

> Usar Playwright o Vercel Agent Browser.

- [ ] T-400: E2E: List movies, search, paginate [depende: T-300]
- [ ] T-401: E2E: Filter by status and visibility [depende: T-300]
- [ ] T-402: E2E: Create new movie (happy path) [depende: T-303]
- [ ] T-403: E2E: Edit existing movie [depende: T-302]
- [ ] T-404: E2E: Delete movie with confirmation modal [depende: T-300]
- [ ] T-405: E2E: Archive movie (soft delete) [depende: T-302]

---

## Fase 6 — Verificación Final

- [ ] T-500: `pnpm lint` — zero TypeScript errors
- [ ] T-501: `pnpm test` — all tests pass (unit + integration)
- [ ] T-502: `pnpm --filter @cinema/admin dev` — manual smoke test in browser
  - [ ] List page loads
  - [ ] Search works
  - [ ] Filters work
  - [ ] Create/Edit/Delete flows work
  - [ ] Archive flow works
- [ ] T-503: Audit logging — verify API creates audit_logs entries for CRUD operations
- [ ] T-504: Update status in spec.md + plan.md to `done`

---

## Leyenda

- `[P]` = tarea paralelizable dentro de la misma fase (no depende de otras [P])
- `[depende: T-NNN]` = no empezar hasta que T-NNN completada
- `[ ]` = pendiente → marca con `[x]` al completar
- Entre fases: siempre secuencial salvo `[P]` en Fase 1 y 2

## Estimaciones (por experiencia)

| Fase | Tareas | Horas est. |
|------|--------|-----------|
| Fase 0 | 2 | 0.5h |
| Fase 1 | 35 | 12h |
| Fase 2 | 27 | 10h |
| Fase 3 | 25 | 12h |
| Fase 4 | 5 | 3h |
| Fase 5 | 6 | 4h |
| Fase 6 | 4 | 2h |
| **Total** | **104** | **~43h** |

Puede acelerase con paralelismo real (2+ dev en Fases 1-2).
