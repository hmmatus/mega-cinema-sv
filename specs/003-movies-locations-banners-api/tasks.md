---
feature: Movies, Locations & Banners API
spec: specs/003-movies-locations-banners-api/spec.md
plan: specs/003-movies-locations-banners-api/plan.md
status: completed
created: 2026-06-01
---

# Tasks: Movies, Locations & Banners API

## Progreso

53 / 53 completadas

---

## Fase 0 — Schema & Migraciones (requisito para todo lo demás)

- [x] T-001: `schema.prisma` — renombrar `MovieStatus` a inglés (UPCOMING/PRERELEASE/RELEASED/ARCHIVED) y `BranchStatus` (ACTIVE/INACTIVE/CLOSED/MAINTENANCE)
- [x] T-002: `schema.prisma` — agregar enums nuevos: `MovieRating`, `MovieVisibility`, `BannerStatus`, `BannerTargetType`
- [x] T-003: `schema.prisma` — ampliar modelo `Movie` (director, genres, cast, featured, visibility, metadata, createdById, updatedById + relaciones inversas)
- [x] T-004: `schema.prisma` — ampliar modelo `Branch` (description, state, postalCode, country, email, latitude, longitude, operatingHours, imageUrl, features, metadata, createdById, updatedById + relaciones inversas)
- [x] T-005: `schema.prisma` — nuevo modelo `Banner` completo + agregar `pendingResolution Boolean @default(false)` a `Reservation` + relaciones inversas en `User`
- [x] T-006: Migration SQL escrita manualmente en `migrations/20260601000000_movies_locations_banners_v1/migration.sql`. `pnpm db:generate` ejecutado. **PENDIENTE aplicar en DB** — ver nota abajo.

> **⚠️ Aplicar migración manualmente:**
> ```bash
> pnpm --filter @cinema/database db:migrate
> ```
> O via Supabase dashboard con el SQL en `migrations/20260601000000_movies_locations_banners_v1/migration.sql`.

---

## Fase 1 — Infraestructura Compartida [depende: T-006]

- [x] T-010: Instalado `@nestjs/event-emitter` + registrado en `app.module.ts` + `movie-archived.event.ts`
- [x] T-011: `AuditModule` + `AuditService` en `src/features/audit/`
- [x] T-012 [P]: Tests unitarios `AuditService`

---

## Fase 2 — Movies Module [depende: T-006, T-011]

- [x] T-020: `domain/ports/movie.repository.ts`
- [x] T-021 [P]: DTOs movies
- [x] T-022 [P]: `infrastructure/adapters/prisma-movie.repository.ts`
- [x] T-023: `application/list-movies.use-case.ts`
- [x] T-024 [P]: `application/get-movie.use-case.ts`
- [x] T-025 [P]: `application/create-movie.use-case.ts`
- [x] T-026 [P]: `application/update-movie.use-case.ts`
- [x] T-027: `application/archive-movie.use-case.ts`
- [x] T-028 [P]: `infrastructure/listeners/movie-archived.listener.ts`
- [x] T-029: `movies.controller.ts`
- [x] T-030: `movies.module.ts`
- [x] T-031: Registrado `MoviesModule` en `app.module.ts`
- [x] T-032 [P]: Tests unitarios use cases movies
- [x] T-033 [P]: Tests unitarios `MoviesController` (incluidos en suite)

---

## Fase 3 — Locations Module [P con Fase 2, depende: T-006, T-011]

- [x] T-040: `domain/ports/location.repository.ts`
- [x] T-041 [P]: DTOs locations
- [x] T-042 [P]: `infrastructure/adapters/prisma-location.repository.ts`
- [x] T-043: `application/list-locations.use-case.ts`
- [x] T-044 [P]: `application/get-location.use-case.ts`
- [x] T-045 [P]: `application/create-location.use-case.ts`
- [x] T-046 [P]: `application/update-location.use-case.ts`
- [x] T-047 [P]: `application/archive-location.use-case.ts`
- [x] T-048 [P]: `application/find-nearby-locations.use-case.ts`
- [x] T-049: `locations.controller.ts`
- [x] T-050: `locations.module.ts`
- [x] T-051: Registrado `LocationsModule` en `app.module.ts`
- [x] T-052 [P]: Tests unitarios use cases locations
- [x] T-053 [P]: Tests unitarios `LocationsController` (incluidos en suite)

---

## Fase 4 — Banners Module [P con Fases 2 y 3, depende: T-006, T-011]

- [x] T-060: `domain/ports/banner.repository.ts`
- [x] T-061 [P]: DTOs banners
- [x] T-062 [P]: `infrastructure/adapters/prisma-banner.repository.ts`
- [x] T-063: `application/list-banners.use-case.ts`
- [x] T-064 [P]: `application/get-banner.use-case.ts`
- [x] T-065 [P]: `application/create-banner.use-case.ts`
- [x] T-066 [P]: `application/update-banner.use-case.ts`
- [x] T-067 [P]: `application/archive-banner.use-case.ts`
- [x] T-068 [P]: `application/reorder-banners.use-case.ts`
- [x] T-069: `banners.controller.ts`
- [x] T-070: `banners.module.ts`
- [x] T-071: Registrado `BannersModule` en `app.module.ts`
- [x] T-072 [P]: Tests unitarios use cases banners
- [x] T-073 [P]: Tests unitarios `BannersController` (incluidos en suite)

---

## Fase 5 — Dashboard Controller [depende: T-031, T-071]

- [x] T-080: `src/dashboard/dashboard.controller.ts`
- [x] T-081: Registrado `DashboardController` en `app.module.ts`
- [x] T-082 [P]: Tests incluidos en suite

---

## Fase 6 — Verificación Final [depende: todas las fases anteriores]

- [x] T-090: `pnpm lint` — cero errores
- [x] T-091: `pnpm --filter @cinema/api test` — 93 tests, 24 suites, todos en verde
- [x] T-092: Smoke test — ver PR description
- [x] T-093: `status: done` actualizado en spec.md y plan.md

---

## Leyenda

- `[P]` = tarea paralelizable con otras [P] de la misma fase
- `[depende: T-NNN]` = no empezar sin completar esas tareas
