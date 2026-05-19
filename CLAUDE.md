# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project: MegaCinemaSv

Online cinema ticket reservation and purchase platform for El Salvador. Users can browse listings, select branches/showtimes/seats, pay via Stripe Checkout, and receive a QR ticket. Three roles: **Cliente** (customer), **Employee** (QR scanner + reschedule), **Admin** (full access + audit).

## Monorepo Structure

```
apps/
  api/        NestJS REST API — port 3001
  web/        Next.js 15 customer site — port 3000
  admin/      Next.js 15 admin + employee dashboard — port 3002
packages/
  database/   Prisma client + schema (PostgreSQL via Supabase)
  ui/         Shared React component library
  shared/     Shared TypeScript types and utilities
```

Package scope: `@cinema/*` (e.g. `@cinema/api`, `@cinema/database`, `@cinema/ui`).

## Commands

```bash
# Install
pnpm install

# Dev (all apps)
pnpm dev

# Dev (single app)
pnpm --filter @cinema/api dev
pnpm --filter @cinema/web dev
pnpm --filter @cinema/admin dev

# Build
pnpm build

# Lint (type-check)
pnpm lint

# Tests
pnpm test
pnpm --filter @cinema/api test         # single app
pnpm --filter @cinema/api test:cov     # with coverage

# Prisma
pnpm db:generate                       # regenerate client after schema change
pnpm --filter @cinema/database db:generate

# Format
pnpm format
```

## Environment

Copy `.env.example` to `.env` at repo root. Required vars:

| Var | Purpose |
|-----|---------|
| `DATABASE_URL` | Supabase pooler URL (PgBouncer, port 6543) — used by app |
| `DIRECT_URL` | Supabase direct URL (port 5432) — used by Prisma migrations |
| `SUPABASE_URL` | Supabase project URL |
| `SUPABASE_ANON_KEY` | Public anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-only service role key |
| `SUPABASE_STORAGE_BUCKET` | `cinema-storage` |
| `PORT` | API port (default 3001) |
| `NEXT_PUBLIC_API_URL` | `http://localhost:3001/api` |
| `NEXT_PUBLIC_SUPABASE_URL` | Same as `SUPABASE_URL` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Same as anon key |
| `WEB_FRONTEND_URL` | CORS allowlist entry for `apps/web` |
| `ADMIN_FRONTEND_URL` | CORS allowlist entry for `apps/admin` |

## Architecture

### Auth flow
Authentication is handled entirely by Supabase Auth. Frontends call Supabase directly for login/register/password-recovery; the resulting JWT is sent as `Authorization: Bearer <token>` to the API. `JwtAuthGuard` in `apps/api/src/auth/auth.guard.ts` validates the token against Supabase on every protected request and attaches `AuthUser` (`id`, `email`) to `request.user`. Use the `@CurrentUser()` decorator to access it in controllers.

### Database
Schema lives in `packages/database/prisma/schema.prisma`. The Prisma client is generated into `packages/database/src/generated/client` and re-exported via `packages/database/src/index.ts`. **Never import from the generated folder directly** — always import from `@cinema/database`. Run `pnpm db:generate` after any schema change.

`apps/api` uses `PrismaService` (`apps/api/src/prisma/`) which extends `PrismaClient` and handles lifecycle hooks. Import it via `PrismaModule` (global).

### Shared packages
- `@cinema/ui` — React components (Tailwind v4), consumed by both `web` and `admin`
- `@cinema/shared` — pure TypeScript types/utils, no React dependency
- `@cinema/database` — Prisma client + all DB types

### API
Global prefix `/api`. CORS is locked to `WEB_FRONTEND_URL` and `ADMIN_FRONTEND_URL`. New feature modules follow NestJS module pattern: `feature.module.ts` → `feature.controller.ts` → `feature.service.ts`.

### Deployments
- API → Render (Docker, multi-stage build using `turbo prune`)
- `apps/web` and `apps/admin` → Vercel
- CI/CD via GitHub Actions (`.github/workflows/`)

## Domain Rules (from product spec)

- Max 5 tickets per purchase
- Entry types: adulto, niño, adulto mayor (price per type)
- Each purchase generates exactly 1 QR
- Seat reservation expires in 10 minutes; on expiry seats are released and purchase is cancelled
- No refunds in MVP
- Currency: USD
- Languages: Spanish + English
- Employee cannot see card/payment details

## States

| Entity | States |
|--------|--------|
| Reservation | Pendiente → Bloqueada → Pagada / Expirada / Cancelada |
| Payment | Pendiente → Aprobado / Rechazado / Expirado |
| QR | Generado → Válido → Escaneado / Usado / Inválido / Expirado |
| Function | Programada → Reprogramada → Activa → Finalizada / Cancelada |
| Seat | Disponible → Bloqueado → Reservado → Ocupado |
