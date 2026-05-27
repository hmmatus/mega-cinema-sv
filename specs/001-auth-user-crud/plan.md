---
feature: Autenticación y Gestión de Usuarios
branch: feat/back-database-v1
status: done
spec: specs/001-auth-user-crud/spec.md
created: 2026-05-27
---

# Plan Técnico: Autenticación y Gestión de Usuarios

## Resumen

Implementa la capa de autenticación completa en `apps/api` usando Supabase Auth como proveedor de identidad, con perfiles de usuario en PostgreSQL vía Prisma. Incluye infraestructura de errores RFC 7807, endpoints de gestión de perfil y lógica de desactivación con restricciones de rol.

---

## Estado del PR

> **Nota:** Este plan documenta la feature implementada en `feat/back-database-v1`. Estado: completado.

| Área | Estado |
|------|--------|
| Schema Prisma completo | ✅ Ya en rama |
| Auth use-cases (signup, login, sync, reset, recover) | ✅ Ya implementados |
| `SupabaseAuthAdapter` + port | ✅ Ya implementado |
| `AuthController` | ✅ Ya implementado (requiere refactor → `HttpProblemException`) |
| `DeactivateUserUseCase` | ✅ Ya implementado (requiere fix: ADMIN→ADMIN guard) |
| `LoginUseCase` | ✅ Ya implementado (requiere fix: verificación INACTIVE) |
| `HttpProblemException` + `ProblemExceptionFilter` | ❌ Falta |
| `UsersController` (GET/PATCH me, deactivate) | ❌ Falta |
| `GetProfileUseCase` + `UpdateProfileUseCase` | ❌ Falta |
| `preferredLanguage` validación enum en DTO | ❌ Falta |

---

## Contexto Técnico

| Aspecto | Decisión |
|---------|----------|
| Apps afectadas | `apps/api` únicamente |
| Paquetes afectados | `@cinema/database` (schema ya existe en rama) |
| Cambios de schema | No — schema completo ya está en rama |
| Endpoints nuevos | `GET /api/users/me`, `PATCH /api/users/me`, `PATCH /api/users/:id/deactivate` |
| Endpoints modificados | `POST /api/auth/login` (INACTIVE check) |
| Servicios externos | Supabase Auth (admin SDK + anon SDK) |
| Testing framework | Jest + NestJS Testing Module |

---

## Verificación de Constitución

- [x] **Principio 1 — Integridad del Dominio:** Auth no toca máquina de estados de reservas, pagos o QR. Employee no accede a datos de pago. ✅
- [x] **Principio 2 — Schema como Fuente de Verdad:** Schema en `packages/database/prisma/schema.prisma` ya tiene `User`, `Role`, `UserStatus`. Correr `pnpm db:generate` antes de merge. ✅
- [x] **Principio 3 — Seguridad por Defecto:** `JwtAuthGuard` en todos los endpoints excepto los marcados `@Public()`. CORS bloqueado. Service role key nunca en responses. `preferredLanguage` validado. ✅
- [x] **Principio 4 — Patrones de Arquitectura:** **DESVIACIÓN DOCUMENTADA** — ver sección abajo.
- [x] **Principio 5 — Calidad antes de Merge:** Tests existentes deben pasar; tests nuevos requeridos para `GetProfileUseCase`, `UpdateProfileUseCase`, `ProblemExceptionFilter`. `pnpm lint` + `pnpm test` verdes antes de merge. ✅

---

## Desviaciones de Arquitectura

| Desviación | Justificación |
|------------|---------------|
| Uso de use-cases (`SignupUseCase`, `LoginUseCase`, etc.) en lugar de `auth.service.ts` | Auth domain requiere aislamiento estricto de la infraestructura Supabase. El port `SupabaseAuthPort` permite swapear el proveedor sin tocar lógica de dominio. Los use-cases son providers NestJS (decorados con `@Injectable()`), mantienen compatibilidad con el módulo system. |
| `UserRepository` port en lugar de inyectar `PrismaService` directamente | Permite testear use-cases sin Prisma real (mock del port). La implementación Prisma (`PrismaUserRepository`) sí usa `PrismaService` correctamente. |

**La desviación es válida** bajo Principio 4: "Desviación permitida solo si el patrón no aplica Y hay justificación documentada en plan.md." El patrón service estándar no permite el nivel de aislamiento requerido para auth con proveedor externo.

---

## Cambios de Schema Prisma

No se requieren cambios — schema completo ya existe en la rama:

```text
packages/database/prisma/schema.prisma
  ✅ enum UserStatus { ACTIVE, INACTIVE, SUSPENDED }
  ✅ model Role { id, name (CLIENTE|EMPLOYEE|ADMIN), ... }
  ✅ model User { id (uuid), roleId, firstName, lastName, email,
                  status (UserStatus), preferredLanguage (default "es"), ... }
  ✅ Todos los modelos de dominio (Reservation, Payment, QR, etc.)
```

**Acción requerida antes de merge:** `pnpm db:generate` para regenerar el cliente Prisma.

---

## Endpoints API

### Existentes (sin cambios de contrato)

| Método | Path | Auth | Descripción |
|--------|------|------|-------------|
| POST | `/api/auth/signup` | Público | Crea cuenta Supabase + perfil DB |
| POST | `/api/auth/login` | Público | Retorna `{ accessToken, userId }` |
| GET | `/api/auth/google` | Público | Retorna URL OAuth de Google |
| POST | `/api/auth/sync` | JWT | Upsert perfil post-OAuth |
| POST | `/api/auth/reset-password` | Público | Envía email de recuperación (204) |
| POST | `/api/auth/recover-password` | JWT | Cambia contraseña con token (204) |

### Nuevos

| Método | Path | Auth | Roles | Descripción |
|--------|------|------|-------|-------------|
| GET | `/api/users/me` | JWT | Todos | Retorna perfil del usuario autenticado |
| PATCH | `/api/users/me` | JWT | Todos | Actualiza firstName, lastName, preferredLanguage |
| PATCH | `/api/users/:id/deactivate` | JWT | Self \| ADMIN | Desactiva cuenta (ADMIN no puede desactivar ADMIN) |

---

## Estructura de Archivos

### Nuevo (a crear)

```text
apps/api/src/common/
  exceptions/
    http-problem.exception.ts       ← HttpProblemException class
  filters/
    problem-exception.filter.ts     ← ProblemExceptionFilter (@Catch)

apps/api/src/users/
  users.module.ts
  users.controller.ts               ← GET /me, PATCH /me, PATCH /:id/deactivate
  application/
    get-profile.use-case.ts
    get-profile.use-case.spec.ts
    update-profile.use-case.ts
    update-profile.use-case.spec.ts
  dtos/
    update-profile.dto.ts
```

### Modificado (cambios requeridos)

```text
apps/api/src/auth/
  auth.controller.ts                ← Reemplazar excepciones NestJS → HttpProblemException
  application/
    login.use-case.ts               ← Añadir verificación UserStatus.INACTIVE
    login.use-case.spec.ts          ← Test para INACTIVE
  dtos/
    sync-profile.dto.ts             ← preferredLanguage: IsIn(['es', 'en'])
    signup.dto.ts                   ← preferredLanguage: IsIn(['es', 'en'])
  users/application/
    deactivate-user.use-case.ts     ← Guard ADMIN→ADMIN
    deactivate-user.use-case.spec.ts ← Test ADMIN→ADMIN

apps/api/src/main.ts                ← Registrar ProblemExceptionFilter globalmente
apps/api/src/app.module.ts          ← Importar UsersModule
```

---

## Contratos de Código

### `HttpProblemException`

```typescript
export class HttpProblemException extends Error {
  constructor(public readonly problem: {
    type: string;       // URI — ej. '/problems/email-already-registered' | 'about:blank'
    title: string;      // Resumen legible del tipo de problema
    status: number;     // HTTP status code
    message: string;    // Descripción específica de esta ocurrencia
    instance?: string;  // Path de la request — ej. '/api/auth/signup'
    details?: Array<{ field: string; message: string }>; // Solo validaciones
  }) {
    super(problem.message);
  }
}
```

### `ProblemExceptionFilter` — comportamiento

- Captura `HttpProblemException` → serializa `problem` directo
- Captura `BadRequestException` de `ValidationPipe` → convierte a 422 con `details[]` (todos los errores de campo)
- Captura otras excepciones NestJS (`NotFoundException`, `ForbiddenException`, etc.) → convierte a Problem Detail usando HTTP status y mensaje
- Siempre establece `Content-Type: application/problem+json`
- `instance` = `request.url` si no está en el `problem`

### `UserRepository` port — métodos requeridos

```typescript
interface UserRepository {
  create(data): Promise<User>
  findById(id: string): Promise<User | null>
  findByIdWithRole(id: string): Promise<(User & { role: Role }) | null>
  upsertProfile(data): Promise<User>
  updateProfile(id: string, data): Promise<User>
  deactivate(id: string): Promise<User>
}
```

---

## Flujo de Datos — Login con INACTIVE check

```text
POST /api/auth/login
  → AuthController.login(dto)
  → LoginUseCase.execute({ email, password })
      1. supabaseAuth.signInWithPassword(email, password)
         → error: throw HttpProblemException(invalid-credentials, 401)
      2. userRepo.findById(userId)
         → null: throw HttpProblemException(user-not-found, 404)
      3. if user.status === INACTIVE:
             throw HttpProblemException(account-inactive, 401)
      4. return { accessToken, userId }
```

---

## Flujo de Datos — Deactivate con ADMIN→ADMIN guard

```text
PATCH /api/users/:id/deactivate
  → UsersController.deactivate(id, currentUser)
  → DeactivateUserUseCase.execute(targetId, { requesterId, requesterRole })
      1. userRepo.findByIdWithRole(targetId)
         → null: throw HttpProblemException(user-not-found, 404)
      2. isSelf = requesterId === targetId
      3. isAdmin = requesterRole === 'ADMIN'
      4. if !isSelf && !isAdmin: throw HttpProblemException(forbidden, 403)
      5. if isAdmin && !isSelf && target.role.name === 'ADMIN':
             throw HttpProblemException(forbidden, 403)  // ADMIN no puede desactivar ADMIN
      6. return userRepo.deactivate(targetId)
```

---

## Plan de Testing

| Capa | Tipo | Qué cubrir |
|------|------|------------|
| `GetProfileUseCase` | Unit | usuario existe → retorna perfil; usuario no existe → 404 Problem |
| `UpdateProfileUseCase` | Unit | actualización parcial (solo firstName); todos los campos; usuario no existe → 404 |
| `DeactivateUserUseCase` | Unit | ADMIN→ADMIN → 403; self-deactivate; admin desactiva CLIENTE |
| `LoginUseCase` | Unit | usuario INACTIVE → 401; credenciales inválidas → 401 |
| `ProblemExceptionFilter` | Unit | `HttpProblemException` → body correcto; `BadRequestException` → 422 + details[]; Content-Type correcto |
| `AuthController` | Unit | errores mapean a `HttpProblemException` correctos |
| `UsersController` | Unit | rutas protegidas; respuestas correctas |

---

## Consideraciones de Seguridad

- `JwtAuthGuard` en `GET /api/users/me`, `PATCH /api/users/me`, `PATCH /api/users/:id/deactivate`
- `PATCH /api/users/:id/deactivate` — validar que requester es self o ADMIN en use-case (no en guard)
- `SupabaseAuthAdapter` usa service role key — nunca expuesta en responses ni logs
- `preferredLanguage` validado con `IsIn(['es', 'en'])` — rechaza valores no permitidos
- `redirectTo` OAuth validado en adapter contra `OAUTH_ALLOWED_REDIRECT_ORIGINS` (ya implementado)
- `ProblemExceptionFilter` no expone stack traces en producción

---

## Preguntas Abiertas

_(ninguna — todas las ambigüedades resueltas en `/speckit.clarify`)_
