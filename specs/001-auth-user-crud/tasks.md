---
feature: Autenticación y Gestión de Usuarios
spec: specs/001-auth-user-crud/spec.md
plan: specs/001-auth-user-crud/plan.md
status: completed
created: 2026-05-27
---

# Tasks: Autenticación y Gestión de Usuarios

## Progreso

21 / 21 completadas

---

> **Nota:** schema ya existe en rama — no hay Fase 0. Las fases van de menor a mayor dependencia.
> Todo el trabajo es en `apps/api`.

---

## Fase 1 — Infraestructura de errores RFC 7807 (foundation)

> Debe completarse primero — fases 2, 3 y 4 dependen de `HttpProblemException`.

- [x] T-001: Crear `apps/api/src/common/exceptions/http-problem.exception.ts`
  - Clase `HttpProblemException extends Error`
  - Campos: `type: string`, `title: string`, `status: number`, `message: string`, `instance?: string`, `details?: Array<{ field: string; message: string }>`

- [x] T-002: Crear `apps/api/src/common/filters/problem-exception.filter.ts` [depende: T-001]
  - `@Catch()` global — intercepta `HttpProblemException`, `BadRequestException` de `ValidationPipe`, y otras excepciones NestJS
  - `HttpProblemException` → serializa `problem` directo
  - `BadRequestException` con errores de `class-validator` → 422 con `details[]` (todos los campos)
  - Otras excepciones NestJS → mapea HTTP status + message a Problem Detail
  - Siempre `Content-Type: application/problem+json`
  - `instance` = `request.url` si no viene en el `problem`

- [x] T-003: Registrar `ProblemExceptionFilter` globalmente en `apps/api/src/main.ts` [depende: T-002]
  - `app.useGlobalFilters(new ProblemExceptionFilter())`

- [x] T-004 [P]: Tests unitarios de `ProblemExceptionFilter` [depende: T-002]
  - `HttpProblemException` 409 → body correcto + `Content-Type: application/problem+json`
  - `BadRequestException` con errores de campo → 422 + `details[]` con todos los errores
  - Excepción NestJS genérica (`ForbiddenException`) → Problem Detail con status 403

---

## Fase 2 — Fixes en código existente [P entre sí, dependen de T-001]

> Tareas paralelas — pueden asignarse a distintas sesiones de trabajo.

- [x] T-010 [P]: Fix `apps/api/src/auth/application/login.use-case.ts` [depende: T-001]
  - Después de `supabaseAuth.signInWithPassword`, llamar `userRepo.findById(userId)`
  - Si `user.status === 'INACTIVE'` → `throw new HttpProblemException({ type: '/problems/account-inactive', title: 'Account Inactive', status: 401, message: 'This account has been deactivated.' })`
  - Actualizar `login.use-case.spec.ts` con test del caso INACTIVE

- [x] T-011 [P]: Fix `apps/api/src/users/application/deactivate-user.use-case.ts` [depende: T-001]
  - Añadir guard: si `isAdmin && !isSelf && target.role.name === 'ADMIN'` → `throw new HttpProblemException({ type: '/problems/forbidden', title: 'Forbidden', status: 403, message: 'Admin cannot deactivate another admin.' })`
  - Actualizar `deactivate-user.use-case.spec.ts` con test ADMIN→ADMIN

- [x] T-012 [P]: Fix DTOs — validar `preferredLanguage`
  - `apps/api/src/auth/dtos/signup.dto.ts` → añadir `@IsIn(['es', 'en'])` en `preferredLanguage`
  - `apps/api/src/auth/dtos/sync-profile.dto.ts` → ídem

- [x] T-013 [P]: Refactor `apps/api/src/auth/auth.controller.ts` [depende: T-001]
  - Reemplazar cualquier throw de excepciones NestJS nativas (`ConflictException`, etc.) por `HttpProblemException` con los tipos definidos en spec:
    - Signup email duplicado → `/problems/email-already-registered` (409)
    - Missing email claim → `/problems/unauthorized` (401)
  - **Nota:** los use-cases ya lanzan sus propias excepciones NestJS — solo refactorizar lo que el controller lanza directamente

---

## Fase 3 — Nuevos use-cases y extensión del port [P entre sí]

> Paralelo con Fase 2. Requiere que `UserRepository` port exista (ya está en rama).

- [x] T-020 [P]: Extender `UserRepository` port con métodos faltantes
  - Ubicación: `apps/api/src/users/domain/ports/user.repository.ts`
  - Añadir: `findById(id: string): Promise<(User & { role: Role }) | null>`
  - Añadir: `updateProfile(id: string, data: { firstName?: string; lastName?: string; preferredLanguage?: string }): Promise<User>`
  - Si existe implementación Prisma (`PrismaUserRepository`), añadir los métodos ahí también

- [x] T-021 [P]: Crear `apps/api/src/users/application/get-profile.use-case.ts` + spec [depende: T-020]
  - Inyecta `UserRepository`
  - `execute(userId: string): Promise<User & { role: Role }>`
  - Si no existe → `throw new HttpProblemException(user-not-found, 404)`
  - Test: usuario existe → retorna perfil; no existe → 404

- [x] T-022 [P]: Crear `apps/api/src/users/application/update-profile.use-case.ts` + spec [depende: T-020]
  - Inyecta `UserRepository`
  - `execute(userId: string, data: UpdateProfileInput): Promise<User>`
  - Si no existe → `throw new HttpProblemException(user-not-found, 404)`
  - Test: actualización parcial (solo firstName); todos los campos; usuario no existe → 404

- [x] T-023 [P]: Crear `apps/api/src/users/dtos/update-profile.dto.ts`
  - Campos opcionales: `firstName?: string`, `lastName?: string`, `preferredLanguage?: 'es' | 'en'`
  - Validaciones: `@IsOptional()`, `@IsString()`, `@MinLength(1)`, `@IsIn(['es', 'en'])` en `preferredLanguage`
  - Al menos un campo debe estar presente (validación a nivel use-case o DTO con `@ValidateIf`)

---

## Fase 4 — UsersModule y UsersController

> Requiere Fase 3 completa.

- [x] T-030: Crear `apps/api/src/users/users.module.ts` [depende: T-021, T-022]
  - Providers: `GetProfileUseCase`, `UpdateProfileUseCase`, `DeactivateUserUseCase`
  - Providers de port: `{ provide: USER_REPOSITORY, useClass: PrismaUserRepository }` (o equivalente)
  - Imports: `PrismaModule` (si no es global ya)

- [x] T-031: Crear `apps/api/src/users/users.controller.ts` [depende: T-030, T-001]
  - `GET /users/me` → `@UseGuards(JwtAuthGuard)` → `getProfileUseCase.execute(user.id)`
  - `PATCH /users/me` → `@UseGuards(JwtAuthGuard)` → `updateProfileUseCase.execute(user.id, dto)`
  - `PATCH /users/:id/deactivate` → `@UseGuards(JwtAuthGuard)` → `deactivateUseCase.execute(id, { requesterId: user.id, requesterRole: user.role })`
  - Todos lanzan `HttpProblemException` si error

- [x] T-032: Registrar `UsersModule` en `apps/api/src/app.module.ts` [depende: T-030]
  - Añadir `UsersModule` al array `imports`

---

## Fase 5 — Verificación Final

- [x] T-040: `pnpm lint` — cero errores de tipos en `apps/api`
- [x] T-041: `pnpm test` — todos los tests en verde (incluyendo nuevos specs)
- [x] T-042: Actualizar `status: done` en `spec.md` y `plan.md`

---

## Leyenda

- `[P]` = tarea paralelizable con otras `[P]` de la misma fase
- `[depende: T-NNN]` = no empezar hasta que T-NNN esté completada
- Marcar completadas: reemplazar `[ ]` con `[x]` y actualizar el contador de Progreso

## Tipos de problema RFC 7807 por tarea

| Tarea | `type` | `status` |
|-------|--------|----------|
| T-010 | `/problems/account-inactive` | 401 |
| T-011 | `/problems/forbidden` | 403 |
| T-013 | `/problems/email-already-registered` | 409 |
| T-013 | `/problems/unauthorized` | 401 |
| T-021 | `/problems/user-not-found` | 404 |
| T-022 | `/problems/user-not-found` | 404 |
| T-004 | `about:blank` (validación) | 422 |
