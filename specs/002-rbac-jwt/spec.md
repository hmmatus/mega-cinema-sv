# API RBAC Design — JWT-based Role Authorization

**Date:** 2026-05-31  
**Scope:** `apps/api` — `auth/` and `users/` modules + `src/features/` folder migration  
**Branch:** `feat/get-user-admin-info`

---

## Problem

`JwtAuthGuard` validates Supabase JWT but only attaches `{ id, email }` to `request.user`. No role enforcement exists. Role checks are buried inline in use cases (e.g. `deactivateUserUseCase`), making them hard to reuse and inconsistent across future features.

## Goal

Establish a reusable, controller-level RBAC pattern using `@Roles()` decorator + `RolesGuard`. Role sourced from Supabase JWT `app_metadata` — zero extra DB queries per request. Pattern must scale to future features (movies, showtimes, etc.).

---

## Architecture

### Role source: Supabase `app_metadata`

Supabase includes `app_metadata` in the `getUser()` response. This field is server-only — clients cannot write it. Role lives at `data.user.app_metadata.role`.

`JwtAuthGuard` is updated to read and attach role:

```ts
request.user = {
  id: data.user.id,
  email: data.user.email ?? '',
  role: (data.user.app_metadata?.role as string) ?? 'user',
};
```

No additional DB query. Role is always available in `request.user` on any JWT-protected route.

### Guards + Decorator

Three new/updated files in `auth/`:

**`roles.decorator.ts`** — metadata setter:
```ts
export const Roles = (...roles: string[]) => SetMetadata('roles', roles);
```

**`roles.guard.ts`** — reads metadata, checks role:
```ts
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(ctx: ExecutionContext): boolean {
    const roles = this.reflector.getAllAndOverride<string[]>('roles', [
      ctx.getHandler(),
      ctx.getClass(),
    ]);
    if (!roles) return true; // no @Roles() = any authenticated user
    const user = ctx.switchToHttp().getRequest().user;
    return roles.includes(user.role);
  }
}
```

**`auth.guard.ts`** — updated to attach `role` from `app_metadata`.

**`current-user.decorator.ts`** — `AuthUser` type updated:
```ts
export interface AuthUser {
  id: string;
  email: string;
  role: string;
}
```

### Usage pattern (scales to any feature)

```ts
// Any authenticated user
@UseGuards(JwtAuthGuard)
@Get('')
getMe() {}

// Admin only
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
@Delete(':id')
deactivate() {}

// Admin or employee
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin', 'employee')
@Get('scan/:qr')
scanQr() {}
```

---

## Role Assignment Rules

| Role | Assigned by | Mechanism |
|------|-------------|-----------|
| `user` | System at first login | `sync-profile` use case calls Supabase admin API to set `app_metadata.role = 'user'` |
| `employee` | Admin via API | `PATCH /api/users/:id/role` — `@Roles('admin')` guarded |
| `admin` | Another admin via API or direct DB insert | Same endpoint or manual DB write |

**Security invariant:** Signup DTO has no `role` field. `ValidationPipe` runs with `whitelist: true` globally — unknown fields are stripped. Website users cannot self-assign roles.

### Supabase admin port

`supabase-auth.port.ts` gains one new method:

```ts
updateUserRole(userId: string, role: string): Promise<void>;
```

`SupabaseAuthAdapter` implements via Supabase admin API (`supabase.auth.admin.updateUserById`).

---

## `users/` Module Changes

### New use case: `assign-role`

```
users/
  application/
    assign-role.use-case.ts
  dtos/
    assign-role.dto.ts   ← { role: 'admin' | 'employee' | 'user' }
```

`AssignRoleUseCase` calls `SupabaseAuthPort.updateUserRole(targetId, role)`.

### Updated endpoint table

| Endpoint | Auth | Role |
|----------|------|------|
| `GET /api/users` | `JwtAuthGuard` | any |
| `PATCH /api/users` | `JwtAuthGuard` | any |
| `DELETE /api/users/:id` | `JwtAuthGuard` + `RolesGuard` | `admin` |
| `PATCH /api/users/:id/role` | `JwtAuthGuard` + `RolesGuard` | `admin` |

### Inline role check removal

`DeactivateUserUseCase` currently checks `requesterRole` internally. This check moves to the controller guard (`@Roles('admin')`). Use case becomes role-agnostic — receives only `targetId`.

---

## `sync-profile` update

On first login, after upserting the user profile in DB, call:

```ts
await this.supabaseAuthPort.updateUserRole(userId, 'user');
```

This writes `app_metadata.role = 'user'` so every subsequent JWT contains the role.

---

## Project Structure: `src/features/` Migration

All feature modules move under `src/features/`. This is a one-time migration; every new feature going forward must be created inside `src/features/`.

```
apps/api/src/
  features/
    auth/          ← moved from src/auth/
      application/
      domain/ports/
      infrastructure/adapters/
      dtos/
      auth.module.ts
      auth.guard.ts
      roles.guard.ts        ← new
      roles.decorator.ts    ← new
      current-user.decorator.ts
    users/         ← moved from src/users/
      application/
      domain/ports/
      infrastructure/adapters/
      dtos/
      users.module.ts
      users.controller.ts
  common/          ← stays at root (cross-cutting)
  prisma/          ← stays at root (infrastructure)
  app.module.ts
  main.ts
```

All internal imports updated to reflect new paths. `app.module.ts` imports updated accordingly.

---

## What does NOT change

- Hexagonal layers (`application/`, `domain/ports/`, `infrastructure/adapters/`) — unchanged
- `PrismaModule` — not touched
- Supabase JWT validation logic — extended, not replaced

---

## Out of scope

- Role management UI in admin dashboard
- Fine-grained permissions (beyond role-level)
- Token refresh forcing (role changes take effect at next token refresh, ~1hr max)
- Caching role lookups
