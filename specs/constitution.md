---
version: 1.0.0
ratified: 2026-05-26
---

# Constitución Técnica — MegaCinemaSv

Este documento define los principios que rigen la arquitectura y el desarrollo.
Todo plan técnico (`plan.md`) DEBE verificar cumplimiento antes de proceder a implementación.

---

## Principio 1 — Integridad del Dominio

**Regla:** Las invariantes de dominio son inviolables en cualquier feature.

- Máx 5 tickets por compra
- Expiración de reserva: exactamente 10 minutos — liberar asientos y cancelar compra al expirar
- Sin reembolsos en MVP
- Cada compra genera exactamente 1 QR
- Employee nunca accede a datos de pago/tarjeta
- Tipos de entrada: adulto, niño, adulto mayor (precio distinto por tipo)
- Moneda: USD — sin conversión

**Si una feature viola alguno de estos puntos:** detener implementación, escalar al equipo.

---

## Principio 2 — Schema como Fuente de Verdad

**Regla:** El schema Prisma en `packages/database/prisma/schema.prisma` es la única fuente de verdad para la estructura de datos.

- Nunca crear tablas o columnas fuera de Prisma
- **Siempre** correr `pnpm db:generate` tras cualquier cambio de schema
- Nunca importar desde `packages/database/src/generated/` directamente — usar `@cinema/database`
- Migraciones: `prisma migrate dev --name [descripción]` en desarrollo, `prisma migrate deploy` en CI/CD
- `DATABASE_URL` = pooler (port 6543), `DIRECT_URL` = directo (port 5432) para migraciones

---

## Principio 3 — Seguridad por Defecto

**Regla:** Todo endpoint API es privado por defecto.

- `JwtAuthGuard` en todos los endpoints a menos que se marque explícitamente `@Public()`
- Roles verificados con guards (no con condicionales en el servicio)
- CORS bloqueado a `WEB_FRONTEND_URL` y `ADMIN_FRONTEND_URL` únicamente
- Datos sensibles (tokens, service role keys) nunca en logs, responses ni código del cliente
- JWT validado contra Supabase por `JwtAuthGuard` en `apps/api/src/auth/auth.guard.ts`

---

## Principio 4 — Patrones de Arquitectura Establecidos

**Regla:** Extender los patrones existentes, no inventar nuevos.

**Backend (`apps/api`):**
- Módulo NestJS: `feature.module.ts` → `feature.controller.ts` → `feature.service.ts`
- Inyectar `PrismaService` por constructor — nunca instanciar `PrismaClient` directamente
- Global prefix `/api`, sin excepción

**Frontend data layer (`apps/web`, `apps/admin`):**
- Schemas Zod para validación de responses + inputs
- TanStack Query para fetch/mutations (ver skill `domain-api`)
- Función de fetch/mutation separada del hook (no inline en `queryFn`)

**Componentes UI:**
- Patrón MVVM: viewmodel hook + TSX de render puro (ver skill `mvvm-component`)
- Tailwind v4 para estilos
- Componentes compartidos → `@cinema/ui`, tipos compartidos → `@cinema/shared`

**Desviación permitida solo si:** el patrón no aplica Y hay justificación documentada en `plan.md` de la feature.

---

## Principio 5 — Calidad antes de Merge

**Regla:** Ningún código llega a `main` sin pasar los gates de calidad.

- `pnpm lint` (type-check) — cero errores
- `pnpm test` — todos los tests en verde
- Tests cubren como mínimo: escenarios P1 del spec + casos borde críticos de dominio
- CI/CD en GitHub Actions es el árbitro final — no "funciona en mi máquina"

---

## Máquina de Estados del Dominio

| Entidad | Transiciones válidas |
|---------|---------------------|
| Reserva | Pendiente → Bloqueada → Pagada / Expirada / Cancelada |
| Pago | Pendiente → Aprobado / Rechazado / Expirado |
| QR | Generado → Válido → Escaneado / Usado / Inválido / Expirado |
| Función | Programada → Reprogramada → Activa → Finalizada / Cancelada |
| Asiento | Disponible → Bloqueado → Reservado → Ocupado |

Toda feature que toque alguna de estas entidades DEBE respetar las transiciones.

---

## Registro de Enmiendas

| Versión | Fecha | Cambio | Razón |
|---------|-------|--------|-------|
| 1.0.0 | 2026-05-26 | Constitución inicial | Adopción de SDD con spec-kit |
