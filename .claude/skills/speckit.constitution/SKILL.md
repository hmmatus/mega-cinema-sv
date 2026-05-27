---
name: speckit.constitution
description: Crea o actualiza specs/constitution.md — el documento de gobernanza del proyecto que define principios arquitectónicos, restricciones y estándares que todo plan debe cumplir. Usar al inicio del proyecto o cuando se quiera formalizar decisiones de arquitectura.
version: 1.0.0
source: spec-kit
---

# speckit.constitution — Gobernanza del Proyecto

Crea o actualiza `specs/constitution.md` con los principios que rigen todas las features.

## Cuándo aplicar

- Inicio del proyecto SDD (antes de cualquier spec)
- Se quiere agregar un nuevo principio arquitectónico
- Se identifica una violación recurrente de un estándar

---

## Template de constitución

```markdown
---
version: 1.0.0
ratified: [YYYY-MM-DD]
amended: [YYYY-MM-DD si aplica]
---

# Constitución Técnica — MegaCinemaSv

Este documento define los principios que rigen la arquitectura y el desarrollo.
Todo plan técnico (`plan.md`) DEBE verificar cumplimiento antes de proceder.

---

## Principio 1 — Integridad del Dominio

**Regla:** Las invariantes de dominio son inviolables en cualquier feature.

- Máx 5 tickets por compra
- Expiración de reserva: exactamente 10 minutos
- Sin reembolsos en MVP
- Cada compra genera exactamente 1 QR
- Employee nunca accede a datos de pago/tarjeta

**Violación detectada:** detener implementación y consultar con el equipo.

---

## Principio 2 — Schema como Fuente de Verdad

**Regla:** El schema Prisma en `packages/database/prisma/schema.prisma` es la única fuente de verdad para la estructura de datos.

- Nunca crear tablas o columnas fuera de Prisma
- Siempre correr `pnpm db:generate` tras cualquier cambio de schema
- Nunca importar desde `packages/database/src/generated/` directamente — usar `@cinema/database`
- Migraciones con `prisma migrate dev` en desarrollo, `prisma migrate deploy` en CI

---

## Principio 3 — Seguridad por Defecto

**Regla:** Todo endpoint API es privado por defecto.

- `JwtAuthGuard` en todos los endpoints a menos que se marque explícitamente como público
- Roles verificados con guards (no con condicionales en el servicio)
- CORS bloqueado a `WEB_FRONTEND_URL` y `ADMIN_FRONTEND_URL`
- Datos sensibles (tokens, keys) nunca en logs ni responses

---

## Principio 4 — Patrones de Arquitectura Establecidos

**Regla:** No inventar patrones. Extender los existentes.

- API: módulo NestJS → controller → service → PrismaService
- Frontend data layer: schemas Zod → TanStack Query (ver skill `domain-api`)
- Componentes UI: patrón MVVM (ver skill `mvvm-component`)
- Compartido entre apps: ir a `@cinema/ui` (React) o `@cinema/shared` (TypeScript puro)

**Desviación permitida solo si:** el patrón no aplica Y hay justificación documentada en `plan.md`.

---

## Principio 5 — Calidad antes de Merge

**Regla:** El código no llega a main sin pasar los gates de calidad.

- `pnpm lint` — sin errores de tipos
- `pnpm test` — todos los tests en verde
- Tests cubren al menos: casos P1 del spec + casos borde críticos

---

## Registro de Enmiendas

| Versión | Fecha | Cambio | Razón |
|---------|-------|--------|-------|
| 1.0.0 | [fecha] | Constitución inicial | Adopción de SDD |
```

---

## Reglas del proceso

1. **Constitución se aprueba, no se impone.** Presentar al usuario antes de guardar.
2. **Principios son pocos y fuertes.** Máx 7. Preferir menos.
3. **Enmiendas documentadas.** Nunca borrar sin registrar en el changelog.
4. **Constitución es inmutable durante una feature activa.** Cambios solo entre features.

---

## Checklist de ejecución

- [ ] Revisar `specs/constitution.md` si existe — no sobreescribir, actualizar
- [ ] Leer `CLAUDE.md` del proyecto para extraer reglas de dominio ya documentadas
- [ ] Draftar constitución con principios relevantes al stack del proyecto
- [ ] Presentar al usuario para aprobación antes de guardar
- [ ] Crear/actualizar `specs/constitution.md`
