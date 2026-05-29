---
feature: Autenticación y Gestión de Usuarios
branch: feat/back-database-v1
status: done
created: 2026-05-27
---

# Autenticación y Gestión de Usuarios

## Resumen

Feature que establece la capa de autenticación del backend usando Supabase Auth como proveedor de identidad, con perfiles de usuario sincronizados en la base de datos de la aplicación. Cubre registro, login, OAuth con Google, recuperación de contraseña y operaciones CRUD básicas de usuario.

---

## Escenarios de Usuario

### [EU-001] [P1] Registro de nuevo usuario (email/contraseña)
- **Given:** usuario no autenticado sin cuenta existente
- **When:** envía `POST /api/auth/signup` con email, password (≥8 chars), firstName, lastName
- **Then:** sistema crea cuenta en Supabase Auth y perfil en DB → retorna perfil `User` creado
- **And:** si el email ya existe en DB, retorna 409 Conflict con mensaje "Email already registered"
- **And:** si la creación del perfil DB falla, elimina la cuenta Supabase (rollback)

### [EU-002] [P1] Login con email/contraseña
- **Given:** usuario registrado con email/contraseña
- **When:** envía `POST /api/auth/login` con credenciales válidas
- **Then:** retorna `{ accessToken: string, userId: string }` con HTTP 200

### [EU-003] [P1] Inicio de OAuth con Google
- **Given:** usuario no autenticado
- **When:** envía `GET /api/auth/google?redirectTo=<url>`
- **Then:** retorna `{ url: string }` — URL de autorización de Google generada por Supabase
- **And:** `redirectTo` debe ser una URL válida

### [EU-004] [P1] Sincronización de perfil post-OAuth
- **Given:** usuario autenticado via OAuth (token JWT válido)
- **When:** envía `POST /api/auth/sync` con firstName, lastName y opcionalmente preferredLanguage
- **Then:** sistema hace upsert del perfil en DB usando id y email del JWT → retorna `User` actualizado

### [EU-005] [P1] Solicitar recuperación de contraseña
- **Given:** usuario con cuenta existente (autenticado o no)
- **When:** envía `POST /api/auth/reset-password` con email válido
- **Then:** Supabase envía email con link de recuperación → API retorna 204 No Content
- **And:** si email no existe en Supabase, respuesta es 204 igualmente (no revelar existencia)

### [EU-006] [P1] Cambiar contraseña con token de recuperación
- **Given:** usuario autenticado con JWT temporal generado por el link de recuperación
- **When:** envía `POST /api/auth/recover-password` con newPassword (≥8 chars)
- **Then:** Supabase actualiza la contraseña → API retorna 204 No Content

### [EU-007] [P2] Desactivar cuenta propia
- **Given:** usuario autenticado (cualquier rol)
- **When:** envía solicitud de desactivación referenciando su propio userId
- **Then:** cuenta pasa a estado INACTIVE → retorna `User` con status actualizado

### [EU-008] [P2] Admin desactiva cualquier usuario
- **Given:** usuario autenticado con rol ADMIN
- **When:** envía solicitud de desactivación referenciando userId de otro usuario
- **Then:** cuenta del target pasa a INACTIVE → retorna `User` actualizado

### [EU-009] [P2] No-admin intenta desactivar otro usuario
- **Given:** usuario autenticado con rol CLIENTE o EMPLOYEE
- **When:** intenta desactivar userId de otro usuario
- **Then:** sistema retorna 403 Forbidden

### [EU-012] [P1] Respuesta de error estructurada (RFC 7807)
- **Given:** cualquier endpoint de auth o usuarios recibe una solicitud inválida o falla
- **When:** el sistema lanza un error (validación, negocio, infra)
- **Then:** respuesta tiene `Content-Type: application/problem+json`
- **And:** body sigue estructura RFC 7807: `{ type, title, status, message, instance }`
- **And:** `status` coincide con el HTTP status code de la respuesta
- **And:** `instance` es el path de la request (ej. `/api/auth/signup`)

### [EU-010] [P2] Obtener perfil propio
- **Given:** usuario autenticado
- **When:** envía `GET /api/users/me`
- **Then:** retorna perfil `User` completo del usuario autenticado (id del JWT)

### [EU-011] [P2] Actualizar perfil propio
- **Given:** usuario autenticado
- **When:** envía `PATCH /api/users/me` con uno o más de: firstName, lastName, preferredLanguage
- **Then:** retorna `User` con campos actualizados

---

## Requisitos Funcionales

| ID | Prioridad | Requisito |
|----|-----------|-----------|
| FR-001 | MUST | Supabase Auth es el único proveedor de identidad — la API no almacena contraseñas |
| FR-002 | MUST | Cada signup crea primero cuenta Supabase y luego perfil DB; si DB falla, eliminar cuenta Supabase |
| FR-003 | MUST | Login retorna `accessToken` JWT de Supabase — el cliente lo usa en `Authorization: Bearer` |
| FR-004 | MUST | `POST /api/auth/sync` y `POST /api/auth/recover-password` requieren JWT válido (`JwtAuthGuard`) |
| FR-005 | MUST | `POST /api/auth/signup`, `POST /api/auth/login`, `GET /api/auth/google`, `POST /api/auth/reset-password` son públicos (`@Public()`) |
| FR-006 | MUST | Solo el propio usuario o un ADMIN puede desactivar una cuenta |
| FR-007 | MUST | `redirectTo` en Google OAuth debe ser URL válida |
| FR-008 | SHOULD | `redirectTo` debe validarse contra `OAUTH_ALLOWED_REDIRECT_ORIGINS` para prevenir open redirect |
| FR-009 | MUST | `preferredLanguage` acepta valores `es` o `en` |
| FR-010 | MUST | Contraseña mínimo 8 caracteres en signup y recover-password |
| FR-011 | MUST | Usuario INACTIVE recibe 401 Problem Detail en login — API verifica status en DB después de que Supabase autentica |
| FR-012 | MUST | Rol por defecto en signup es CLIENTE |
| FR-019 | MUST | `GET /api/users/me` retorna perfil del usuario autenticado (requiere JWT) |
| FR-020 | MUST | `PATCH /api/users/me` actualiza firstName, lastName y/o preferredLanguage del usuario autenticado (requiere JWT) |
| FR-021 | MUST | ADMIN no puede desactivar otro ADMIN — `DeactivateUserUseCase` verifica rol del target y lanza 403 si target es ADMIN |
| FR-013 | MUST | Todos los errores de la API retornan `Content-Type: application/problem+json` con estructura RFC 7807 |
| FR-014 | MUST | Existe una clase `HttpProblemException` (o equivalente) que encapsula los campos RFC 7807: `type`, `title`, `status`, `detail`, `instance` |
| FR-015 | MUST | Controllers lanzan `HttpProblemException` directamente — no retornan objetos de error desde servicios/use-cases |
| FR-016 | MUST | Un `ExceptionFilter` global intercepta `HttpProblemException` y serializa la respuesta con `Content-Type: application/problem+json` |
| FR-017 | SHOULD | `type` es una URI que identifica el tipo de problema (ej. `/problems/email-already-registered`); si no hay URI específica, usa `about:blank` |
| FR-018 | SHOULD | `instance` incluye el path de la request (ej. `/api/auth/signup`) para identificar la ocurrencia específica |

---

## Entidades Clave

| Entidad | Atributos relevantes | Notas |
|---------|---------------------|-------|
| User | id (uuid, mismo que Supabase), email, firstName, lastName, preferredLanguage, role, status | id viene de Supabase Auth, no generado por DB |
| Role | name: CLIENTE \| EMPLOYEE \| ADMIN | Asignado en signup; cambiado solo por ADMIN |
| AuthUser | id, email | Extraído del JWT por `JwtAuthGuard`; disponible via `@CurrentUser()` |
| ProblemDetail | type (URI), title (string), status (int), detail (string), instance (URI) | Estructura RFC 7807 — retornada en toda respuesta de error; `Content-Type: application/problem+json` |

**Estados relevantes:** User status → `ACTIVE` / `INACTIVE` (desactivación; no hay reactivación en MVP)

---

## Criterios de Éxito

| ID | Criterio | Cómo medir |
|----|----------|------------|
| SC-001 | Todos los P1 user scenarios cubiertos por tests unitarios | `pnpm test` verde |
| SC-002 | Signup con email duplicado retorna 409 (no 500) | Test unitario EU-001 |
| SC-003 | Supabase rollback ejecuta si DB falla en signup | Test unitario con mock de `userRepo.create` lanzando error |
| SC-004 | Endpoint protegido sin JWT retorna 401 | Test de integración o e2e |
| SC-005 | No-admin no puede desactivar otro usuario | Test unitario EU-009 |
| SC-006 | Respuesta de error tiene `Content-Type: application/problem+json` y estructura RFC 7807 | Test e2e o integración con body assertion |
| SC-007 | `HttpProblemException` con status 409 retorna `status: 409`, `title`, `detail` correctos | Test unitario del ExceptionFilter |

---

## Casos Borde

- [ ] Signup con email que existe en Supabase pero no en DB (usuario huérfano)
- [ ] Login con credenciales inválidas — Supabase retorna error, API debe retornar 401
- [ ] `POST /api/auth/sync` con JWT de usuario que no existe en DB — retorna 404 Problem Detail `type: /problems/user-not-found` (no crea perfil)
- [ ] `POST /api/auth/recover-password` con JWT expirado del link de recuperación
- [ ] Google OAuth con `redirectTo` a dominio no permitido — retorna 400 con Problem Detail `type: /problems/untrusted-redirect`
- [ ] Errores de validación de DTO — `ProblemExceptionFilter` intercepta el `BadRequestException` de `ValidationPipe` y lo serializa como 422 con `details[]` conteniendo todos los errores de campo
- [ ] Usuario INACTIVE intenta login — Supabase retorna token, API verifica status en DB post-autenticación y retorna 401 Problem Detail `type: /problems/account-inactive`
- [ ] ADMIN no puede desactivar otro ADMIN — `DeactivateUserUseCase` debe verificar rol del target; si target es ADMIN, lanzar 403 Problem Detail. No existe rol superadmin en MVP.
- [ ] `preferredLanguage` con valor inválido (ej. "fr") — rechazado por DTO como error de validación (422 con `details` array)

---

## Suposiciones

- Supabase maneja verificación de email y sesiones; el JWT resultante es válido para la API
- El link de recuperación de Supabase autentica al usuario con un JWT temporal — por eso `recover-password` usa `JwtAuthGuard`
- `POST /api/auth/sync` es llamado por el frontend después del callback OAuth para persistir el perfil
- Roles existen como entidad separada en DB (la desactivación consulta `findByIdWithRole`)
- No hay endpoint de reactivación de usuario en MVP

---

## Dependencias

- [ ] Supabase Auth configurado con Google OAuth provider habilitado
- [ ] Schema Prisma con modelos `User` y `Role` (debe existir antes de merge)
- [ ] `packages/database` exporta tipo `User` y cliente Prisma
- [ ] Variables de entorno: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `OAUTH_ALLOWED_REDIRECT_ORIGINS`

---

## Fuera de Alcance (MVP)

- Reactivación de usuarios desactivados
- 2FA / MFA
- Gestión de sesiones múltiples / revocación de tokens
- Endpoint de eliminación permanente de cuenta
- Login con Apple o otros proveedores OAuth
- Rate limiting en endpoints de auth (asumido manejado por Supabase o API gateway)
- `GET /api/users/me` y `PATCH /api/users/me` — incluidos en este scope (EU-010, EU-011)

---

## Contrato de Error — RFC 7807 (variante custom)

Toda respuesta de error sigue [RFC 7807](https://datatracker.ietf.org/doc/html/rfc7807) con una extensión: `detail` se renombra a `message`, y errores de validación incluyen campo adicional `details` (array).

**Error de negocio (single error):**
```json
{
  "type": "/problems/email-already-registered",
  "title": "Email Already Registered",
  "status": 409,
  "message": "The email address is already associated with an existing account.",
  "instance": "/api/auth/signup"
}
```

**Error de validación de DTO (múltiples campos):**
```json
{
  "type": "about:blank",
  "title": "Validation Error",
  "status": 422,
  "message": "Request validation failed.",
  "instance": "/api/auth/signup",
  "details": [
    { "field": "email", "message": "must be an email" },
    { "field": "password", "message": "must be longer than or equal to 8 characters" }
  ]
}
```

**Implementación:**
- `HttpProblemException` — clase con campos: `type`, `title`, `status`, `message`, `instance`, `details?`
- `ProblemExceptionFilter` — `ExceptionFilter` de NestJS global; intercepta `HttpProblemException` y errores de validación de `ValidationPipe`; serializa con `Content-Type: application/problem+json`
- Controllers y use-cases lanzan `HttpProblemException` — nunca retornan objetos de error

**Tipos de problema para esta feature:**

| `type` | `status` | Cuándo |
|--------|----------|--------|
| `/problems/email-already-registered` | 409 | Signup con email duplicado |
| `/problems/invalid-credentials` | 401 | Login con credenciales incorrectas |
| `/problems/account-inactive` | 401 | Login de usuario INACTIVE |
| `/problems/untrusted-redirect` | 400 | OAuth con `redirectTo` no permitido |
| `/problems/user-not-found` | 404 | Desactivar usuario inexistente |
| `/problems/forbidden` | 403 | No-admin desactiva otro usuario; ADMIN desactiva otro ADMIN |
| `about:blank` | 422 | Errores de validación de DTO (incluye `details[]`) |

---

## Notas de Arquitectura

El PR usa arquitectura hexagonal (ports/adapters + use-cases) en lugar del patrón `module → controller → service` de la Constitución (Principio 4). Desviación válida para auth por aislamiento de infraestructura Supabase, pero **debe justificarse en `plan.md`** antes de merge.
