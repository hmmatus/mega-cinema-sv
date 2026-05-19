# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## @cinema/api — NestJS REST API

Serves both `apps/web` (customer site) and `apps/admin` (admin dashboard) on port **3001** under global prefix `/api`.

## Commands

```bash
pnpm --filter @cinema/api dev          # watch mode
pnpm --filter @cinema/api build        # compile to dist/
pnpm --filter @cinema/api test         # jest unit tests
pnpm --filter @cinema/api test:cov     # with coverage report
pnpm --filter @cinema/api test:e2e     # e2e suite
pnpm --filter @cinema/api lint         # tsc --noEmit
```

## Module Structure

```
src/
  main.ts             Bootstrap: global prefix, CORS, port
  app.module.ts       Root module — imports ConfigModule (global), PrismaModule, AuthModule
  app.controller.ts   Health / root endpoint
  auth/
    auth.module.ts
    auth.guard.ts       JwtAuthGuard — validates Supabase JWT on every protected route
    current-user.decorator.ts  @CurrentUser() → AuthUser { id, email }
  prisma/
    prisma.module.ts    Global module exporting PrismaService
    prisma.service.ts   Extends PrismaClient, handles onModuleInit/onModuleDestroy
```

## Auth

`JwtAuthGuard` is a NestJS guard that:
1. Reads `Authorization: Bearer <token>` header
2. Calls `supabase.auth.getUser(token)` (stateless — no local JWT parsing)
3. Attaches `request.user` as `AuthUser`

Apply per-controller or per-route with `@UseGuards(JwtAuthGuard)`. Access user in handler with `@CurrentUser() user: AuthUser`.

Employee vs Admin role enforcement must be handled in service/guard layer using Supabase user metadata or a roles table (not yet implemented — add as part of RBAC feature work).

## Database

Import from `@cinema/database`, not from the generated client path directly.

```typescript
import { PrismaService } from '../prisma/prisma.service';
// or for types:
import type { User } from '@cinema/database';
```

`PrismaService` is provided globally via `PrismaModule`. Add it to any feature module's constructor injection.

## Adding a Feature Module

```
src/
  movies/
    movies.module.ts
    movies.controller.ts
    movies.service.ts
    dto/
      create-movie.dto.ts
```

Register in `app.module.ts` imports array. Use class-validator DTOs. Keep business logic in the service, not the controller.

## Domain Specifics

- **Seat locking**: when a user starts checkout, seats are locked for 10 minutes. Implement with a scheduled task (NestJS `@nestjs/schedule`) to release expired reservations.
- **Stripe webhooks**: receive at `/api/payments/webhook`. Verify the Stripe signature using `stripe.webhooks.constructEvent`. Never trust checkout status from client-side redirect — always confirm from webhook.
- **QR generation**: one QR per purchase, generated server-side after payment confirmation. Store QR value in DB; render in frontend.
- **Audit log**: every Employee action (reschedule, QR scan) must write to an audit table with `employeeId`, `action`, `entityId`, `oldValue`, `newValue`, `timestamp`.
- **Concurrency**: seat selection must use DB-level locking (`SELECT ... FOR UPDATE`) or Prisma transactions to prevent double-booking.

## Docker

Multi-stage Dockerfile uses `turbo prune --scope=@cinema/api` to copy only required workspace packages. Build from repo root:

```bash
docker build -f apps/api/Dockerfile -t cinema-api .
```

Health check endpoint must exist at `GET /api/health` (returns 200).

## Environment Variables

All vars loaded via `ConfigModule.forRoot({ isGlobal: true })` from `.env.local` then `.env`. Use `ConfigService.getOrThrow()` for required vars to fail fast on missing config.

Required: `DATABASE_URL`, `DIRECT_URL`, `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `PORT`, `WEB_FRONTEND_URL`, `ADMIN_FRONTEND_URL`.
