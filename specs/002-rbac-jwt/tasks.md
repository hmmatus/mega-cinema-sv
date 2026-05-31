---
feature: JWT-based RBAC + src/features/ migration
spec: specs/002-rbac-jwt/spec.md
plan: specs/002-rbac-jwt/plan.md
status: completed
created: 2026-05-31
---

# Tasks: JWT-based RBAC + src/features/ Migration

## Progreso

0 / 28 completadas

---

## Fase 0 — Migración de carpetas (prerequisito para todo lo demás)

- [ ] T-001: `git mv apps/api/src/auth apps/api/src/features/auth` — mover con historial preservado
- [ ] T-002: `git mv apps/api/src/users apps/api/src/features/users` — mover con historial preservado
- [ ] T-003: Actualizar imports dentro de `features/auth/` — reemplazar `../` relativos rotos tras el mv [depende: T-001]
- [ ] T-004: Actualizar imports dentro de `features/users/` — reemplazar `../auth/` y similares [depende: T-002]
- [ ] T-005: Actualizar `apps/api/src/app.module.ts` — import paths de `AuthModule` y `UsersModule` [depende: T-001, T-002]
- [ ] T-006: `pnpm --filter @cinema/api lint` — cero errores antes de continuar [depende: T-003, T-004, T-005]

---

## Fase 1 — RBAC core en auth [P]

> T-010 primero. T-011, T-012, T-013 paralelizables entre sí. T-014 cierra la fase.

- [ ] T-010: Actualizar `AuthUser` en `current-user.decorator.ts` — agregar `role: string` [depende: T-006]
- [ ] T-011 [P]: Actualizar `auth.guard.ts` — leer `data.user.app_metadata?.role ?? 'user'`, attach al `request.user` [depende: T-010]
- [ ] T-012 [P]: Crear `features/auth/roles.decorator.ts` — `@Roles(...roles: string[])` via `SetMetadata` [depende: T-006]
- [ ] T-013 [P]: Crear `features/auth/roles.guard.ts` — `RolesGuard` con `Reflector`, lee `request.user.role` [depende: T-010]
- [ ] T-014: Actualizar `auth.module.ts` — exportar `RolesGuard` [depende: T-011, T-012, T-013]

---

## Fase 2 — Supabase port + adapter [P]

> Paralelizable con Fase 1 (ambas trabajan en features/auth/, sin dependencia entre sí).

- [ ] T-020 [P]: Agregar `updateUserRole(userId: string, role: string): Promise<void>` a `supabase-auth.port.ts` [depende: T-006]
- [ ] T-021: Implementar `updateUserRole` en `supabase-auth.adapter.ts` via `supabase.auth.admin.updateUserById` — usar `SUPABASE_SERVICE_ROLE_KEY` [depende: T-020]

---

## Fase 3 — sync-profile: asignar rol por defecto

- [ ] T-030: Actualizar `sync-profile.use-case.ts` — llamar `supabaseAuthPort.updateUserRole(userId, 'user')` solo si `app_metadata.role` no existe (no sobrescribir admin/employee en re-login) [depende: T-021]

---

## Fase 4 — assign-role use case + endpoint [P]

> T-040 y T-041 paralelizables. T-042 y T-043 dependen de ambos.

- [ ] T-040 [P]: Crear `features/users/dtos/assign-role.dto.ts` — `{ role: 'admin' | 'employee' | 'user' }` con `@IsIn` validator [depende: T-006]
- [ ] T-041 [P]: Crear `features/users/application/assign-role.use-case.ts` — recibe `targetId + role`, llama `SupabaseAuthPort.updateUserRole` [depende: T-021]
- [ ] T-042: Actualizar `users.module.ts` — importar `AuthModule`, registrar `AssignRoleUseCase` [depende: T-040, T-041, T-014]
- [ ] T-043: Agregar `PATCH /users/:id/role` a `users.controller.ts` — `@UseGuards(JwtAuthGuard, RolesGuard)` + `@Roles('admin')` [depende: T-042]

---

## Fase 5 — Cleanup: deactivate use case + controller

- [ ] T-050: Actualizar `deactivate-user.use-case.ts` — eliminar parámetro `requesterRole` y lógica interna de verificación de rol [depende: T-006]
- [ ] T-051: Actualizar `DELETE /users/:id` en `users.controller.ts` — agregar `@UseGuards(JwtAuthGuard, RolesGuard)` + `@Roles('admin')`, eliminar llamada a `findUserUseCase` para obtener rol del requester [depende: T-050, T-014]

---

## Fase 6 — Tests [P]

> Todos paralelizables entre sí. Dependen de fases 1-5 completas.

- [ ] T-060 [P]: Crear `features/auth/roles.guard.spec.ts` — casos: sin `@Roles()` (pass), rol match (pass), rol mismatch (ForbiddenException o false) [depende: T-013]
- [ ] T-061 [P]: Crear `features/users/application/assign-role.use-case.spec.ts` — mock port, verificar `updateUserRole` llamado con args correctos [depende: T-041]
- [ ] T-062 [P]: Actualizar `features/auth/infrastructure/adapters/supabase-auth.adapter.spec.ts` — agregar tests para `updateUserRole` [depende: T-021]
- [ ] T-063 [P]: Actualizar `features/users/users.controller.spec.ts` — test `PATCH /:id/role` invoca use case; test `DELETE /:id` no pasa `requesterRole` [depende: T-043, T-051]
- [ ] T-064 [P]: Actualizar `features/users/application/deactivate-user.use-case.spec.ts` — reflejar remoción de `requesterRole` [depende: T-050]
- [ ] T-065 [P]: Actualizar `features/auth/application/sync-profile.use-case.spec.ts` — verificar que `updateUserRole('user')` se llama solo si rol no existe [depende: T-030]

---

## Fase 7 — Verificación Final

- [ ] T-070: `pnpm --filter @cinema/api lint` — cero errores de tipos
- [ ] T-071: `pnpm --filter @cinema/api test` — todos los tests en verde
- [ ] T-072: Actualizar `status: done` en `spec.md` y `plan.md`

---

## Leyenda

- `[P]` = paralelizable con otras `[P]` de la misma fase
- `[depende: T-NNN]` = no empezar hasta que T-NNN esté completada
- Marcar completadas reemplazando `[ ]` con `[x]`
