---
feature: JWT-based RBAC + src/features/ migration
branch: feat/get-user-admin-info
status: draft
spec: specs/002-rbac-jwt/spec.md
created: 2026-05-31
---

# Plan Técnico: JWT-based RBAC + src/features/ Migration

## Resumen

Migrar `auth/` y `users/` a `src/features/`, enriquecer `JwtAuthGuard` con `role` leído del JWT `app_metadata`, y agregar `RolesGuard` + `@Roles()` para control de acceso por rol a nivel de controlador. Sin cambios de schema — el modelo `Role` ya existe.

---

## Contexto Técnico

| Aspecto | Decisión |
|---------|----------|
| Apps afectadas | `apps/api` únicamente |
| Paquetes afectados | Ninguno |
| Cambios de schema | No — `Role` ya existe en schema |
| Nuevos endpoints | `PATCH /api/users/:id/role` |
| Servicios externos | Supabase Admin API (`auth.admin.updateUserById`) |
| Testing framework | Jest |

---

## Verificación de Constitución

- [x] **Principio 1 (Integridad de dominio)** — no toca pagos, QR, reservas, ni asientos. Employee no accede a datos de pago ✓
- [x] **Principio 2 (Schema como verdad)** — no hay cambios de schema. `pnpm db:generate` no requerido ✓
- [x] **Principio 3 (Seguridad por defecto)** — `JwtAuthGuard` en todos los endpoints existentes; nuevos endpoints de rol protegidos con `JwtAuthGuard` + `RolesGuard` + `@Roles('admin')` ✓
- [x] **Principio 4 (Patrones establecidos)** — desviación documentada: módulos se mueven a `src/features/` (nuevo estándar aprobado en spec). Patrón hexagonal se mantiene intacto ✓
- [x] **Principio 5 (Calidad antes de merge)** — `pnpm lint` + `pnpm test` requeridos al final. Tests para `RolesGuard`, `AssignRoleUseCase`, y guards actualizados ✓

**Desviación:** `src/features/` no referenciado en constitución v1.0.0 — aprobado en `specs/002-rbac-jwt/spec.md` como nuevo estándar. Constitución debe actualizarse en Principio 4 post-merge.

---

## Cambios de Schema Prisma

Ninguno. El modelo `Role` y la relación `User.roleId` ya existen.

---

## Nuevos Endpoints API (`apps/api`)

| Método | Path | Auth | Roles | Descripción |
|--------|------|------|-------|-------------|
| PATCH | `/api/users/:id/role` | JWT | `admin` | Admin asigna rol a otro usuario |

Módulo: `apps/api/src/features/users/`

---

## Estructura de Archivos Final

```
apps/api/src/
  features/
    auth/
      application/
        login.use-case.ts
        recover-password.use-case.ts
        reset-password.use-case.ts
        signup.use-case.ts
        sync-profile.use-case.ts       ← actualizado: set app_metadata.role='user'
      domain/ports/
        supabase-auth.port.ts          ← + updateUserRole(userId, role)
      infrastructure/adapters/
        supabase-auth.adapter.ts       ← implementa updateUserRole
      dtos/
        (sin cambios)
      auth.module.ts
      auth.guard.ts                    ← actualizado: attach role from app_metadata
      roles.guard.ts                   ← nuevo
      roles.decorator.ts               ← nuevo
      current-user.decorator.ts        ← actualizado: AuthUser + role field
    users/
      application/
        find-user.use-case.ts
        update-user.use-case.ts
        deactivate-user.use-case.ts    ← actualizado: remove inline role check
        assign-role.use-case.ts        ← nuevo
      domain/ports/
        user.repository.ts             (sin cambios)
      infrastructure/adapters/
        prisma-user.repository.ts      (sin cambios)
      dtos/
        update-user.dto.ts             (sin cambios)
        assign-role.dto.ts             ← nuevo
      users.module.ts                  ← actualizado: register AssignRoleUseCase
      users.controller.ts              ← actualizado: @Roles guards + new endpoint
  common/                              (sin cambios)
  prisma/                              (sin cambios)
  app.module.ts                        ← actualizado: import paths
  main.ts                              (sin cambios)
```

---

## Fases de Implementación

### Fase 0 — Migración de carpetas

Mover `src/auth/` → `src/features/auth/` y `src/users/` → `src/features/users/`. Actualizar todos los imports internos y en `app.module.ts`. Verificar `pnpm lint` antes de continuar.

### Fase 1 — RBAC core en auth

1. Actualizar `AuthUser` en `current-user.decorator.ts`: agregar `role: string`
2. Actualizar `auth.guard.ts`: leer `app_metadata.role` del response de Supabase, attach al `request.user`
3. Crear `roles.decorator.ts`: `@Roles(...roles)`
4. Crear `roles.guard.ts`: `RolesGuard` con `Reflector`
5. Registrar `RolesGuard` en `auth.module.ts` exports

### Fase 2 — Port + adapter updateUserRole

1. Agregar `updateUserRole(userId: string, role: string): Promise<void>` a `supabase-auth.port.ts`
2. Implementar en `supabase-auth.adapter.ts` vía `supabase.auth.admin.updateUserById`

### Fase 3 — sync-profile: set default role

Actualizar `sync-profile.use-case.ts`: tras `upsertProfile`, llamar `supabaseAuthPort.updateUserRole(userId, 'user')` solo si el usuario no tiene rol asignado (para no sobrescribir admin/employee en re-sincronización).

### Fase 4 — assign-role use case + endpoint

1. Crear `assign-role.dto.ts`: `{ role: 'admin' | 'employee' | 'user' }`
2. Crear `assign-role.use-case.ts`: recibe `targetId + role`, llama `supabaseAuthPort.updateUserRole`
3. Agregar `PATCH /users/:id/role` a `users.controller.ts` con `@UseGuards(JwtAuthGuard, RolesGuard)` + `@Roles('admin')`
4. Registrar en `users.module.ts` — importar `AuthModule` para `RolesGuard`

### Fase 5 — Cleanup: deactivate role check

Actualizar `deactivate-user.use-case.ts`: eliminar parámetro `requesterRole` y lógica de verificación. Actualizar `users.controller.ts`: agregar `@UseGuards(JwtAuthGuard, RolesGuard)` + `@Roles('admin')` al endpoint `DELETE /users/:id`.

### Fase 6 — Tests

- `roles.guard.spec.ts`: casos sin `@Roles()`, rol correcto, rol incorrecto
- `assign-role.use-case.spec.ts`: asignación exitosa, port llamado correctamente
- `supabase-auth.adapter.spec.ts`: actualizar/agregar test para `updateUserRole`
- `users.controller.spec.ts`: test del nuevo endpoint con mock de guard

---

## Flujo de Datos

```
Request → JwtAuthGuard (validates JWT + reads app_metadata.role)
        → request.user = { id, email, role }
        → RolesGuard (checks @Roles() metadata vs request.user.role)
        → Controller → UseCase → [SupabaseAuthAdapter | PrismaRepository]
```

---

## Plan de Testing

| Capa | Tipo | Qué testear |
|------|------|-------------|
| `roles.guard.ts` | Unit | Sin roles: pass; rol match: pass; rol mismatch: reject |
| `assign-role.use-case.ts` | Unit | Llama port con userId + role correcto |
| `supabase-auth.adapter.ts` | Unit | `updateUserRole` llama admin API con params correctos |
| `users.controller.ts` | Unit | `PATCH /:id/role` invoca use case; `DELETE /:id` ya no pasa requesterRole |
| `deactivate-user.use-case.ts` | Unit | Acepta solo `targetId`, sin verificación de rol |

---

## Consideraciones de Seguridad

- [x] `app_metadata` es server-only en Supabase — cliente no puede escribirlo
- [x] `whitelist: true` + `forbidNonWhitelisted: true` en `ValidationPipe` global — rol no puede inyectarse via DTO de signup
- [x] `PATCH /users/:id/role` solo accesible por `admin` — `RolesGuard` lo verifica antes de llegar al use case
- [x] `sync-profile` no sobrescribe rol existente — evita degradar admin a user en re-login
- [x] `SUPABASE_SERVICE_ROLE_KEY` requerido para admin API — cargado via `ConfigService.getOrThrow()`

---

## Desviaciones de Arquitectura

| Desviación | Justificación | Aprobado por |
|------------|---------------|--------------|
| Features en `src/features/` en vez de `src/` | Screaming architecture — nombre de feature visible en top-level | spec 002-rbac-jwt |
| `users.module.ts` importa `AuthModule` | Necesario para inyectar `RolesGuard` exportado por `AuthModule` | spec 002-rbac-jwt |

---

## Preguntas Abiertas

Ninguna — spec completamente clarificado.
