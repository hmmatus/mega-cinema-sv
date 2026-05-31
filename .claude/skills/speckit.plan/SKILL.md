---
name: speckit.plan
description: Genera el plan técnico de implementación para una feature ya especificada con speckit.specify. Usar después de tener spec.md listo. Genera specs/NNN-feature-name/plan.md con arquitectura, stack técnico, estructura de archivos, verificación de constitución y plan de datos.
version: 1.0.0
source: spec-kit
---

# speckit.plan — Generar Plan Técnico

Genera `specs/NNN-feature-name/plan.md` a partir de un `spec.md` existente.

## Cuándo aplicar

- El usuario tiene un `spec.md` listo y quiere planear la implementación
- Antes de generar tasks o escribir código

**Requisito obligatorio:** debe existir `spec.md` para esta feature. Sin spec, pedir que ejecuten `/speckit.specify` primero.

---

## Paso 1 — Leer spec.md

```bash
cat specs/NNN-feature-name/spec.md
```

Extraer: entidades, RF con MUST, escenarios P1, restricciones de dominio.

## Paso 2 — Leer constitución del proyecto

```bash
cat specs/constitution.md
```

Identificar principios que apliquen a esta feature.

## Paso 3 — Generar plan.md

```markdown
---
feature: [Nombre — debe coincidir con spec.md]
branch: feat/[slug]
status: draft
spec: specs/[NNN-feature-name]/spec.md
created: [YYYY-MM-DD]
---

# Plan Técnico: [Nombre de la Feature]

## Resumen

[1-2 oraciones: qué se va a construir y en qué capas del monorepo.]

---

## Contexto Técnico

| Aspecto | Decisión |
|---------|----------|
| Apps afectadas | `apps/api` / `apps/web` / `apps/admin` |
| Paquetes afectados | `@cinema/database` / `@cinema/ui` / `@cinema/shared` |
| Cambios de schema | Sí / No — [describir si sí] |
| Nuevos endpoints | [lista] |
| Servicios externos | Supabase / Stripe / ninguno |
| Testing framework | Jest (api) / Vitest (web, admin) |

---

## Verificación de Constitución

Checklist contra `specs/constitution.md`:

- [ ] [Principio 1 aplica] — [cómo se cumple]
- [ ] [Principio 2 aplica] — [cómo se cumple]
- [ ] Desviaciones documentadas: [ninguna / describir con justificación]

---

## Cambios de Schema Prisma

> Si no hay cambios de schema, omitir esta sección.

```prisma
// Nuevos modelos o campos en packages/database/prisma/schema.prisma
model NuevoModelo {
  id        String   @id @default(cuid())
  // ...
}
```

**Acción requerida:** `pnpm db:generate` tras cualquier cambio de schema.

---

## Nuevos Endpoints API (`apps/api`)

| Método | Path | Auth | Roles | Descripción |
|--------|------|------|-------|-------------|
| GET | `/api/[path]` | JWT | Cliente | [descripción] |
| POST | `/api/[path]` | JWT | Admin | [descripción] |

Módulo NestJS: `apps/api/src/features/[feature]/`  
Patrón: `[feature].module.ts` → `[feature].controller.ts` → `[feature].service.ts`

---

## Estructura de Archivos

```
apps/api/src/features/[feature]/
  [feature].module.ts
  [feature].controller.ts
  application/
    [action]-[feature].use-case.ts
  domain/ports/
    [feature].repository.ts
  infrastructure/adapters/
    prisma-[feature].repository.ts
  dtos/
    create-[feature].dto.ts
    [feature]-response.dto.ts

packages/database/prisma/
  schema.prisma            ← si hay cambios

apps/web/src/
  domains/[feature]/       ← capa de datos (TanStack Query + Zod)
  features/[feature]/      ← componentes + páginas

apps/admin/src/
  [path si aplica]
```

---

## Flujo de Datos

```
[Usuario] → [Componente TSX]
         → [Viewmodel Hook]
         → [TanStack Query / Mutation]
         → [fetch fn + Zod validation]
         → [API: NestJS Controller]
         → [Service]
         → [PrismaService]
         → [Supabase PostgreSQL]
```

---

## Plan de Testing

| Capa | Tipo | Qué testear |
|------|------|-------------|
| `apps/api` | Unit (Jest) | Service + lógica de negocio |
| `apps/api` | Integration | Controller → Service → DB (test DB) |
| `apps/web` | Unit | Viewmodel hooks, utils, schemas Zod |

---

## Consideraciones de Seguridad

- [ ] Endpoints protegidos con `JwtAuthGuard`
- [ ] Roles verificados con guards apropiados
- [ ] Employee no ve datos de pago (regla de dominio)
- [ ] Datos sensibles no expuestos en responses

---

## Desviaciones de Arquitectura

| Desviación | Justificación | Aprobado por |
|------------|---------------|--------------|
| [si aplica] | [razón] | [quién] |

---

## Preguntas Abiertas

- [ ] [NEEDS CLARIFICATION] [Pregunta técnica sin resolver]
```

---

## Reglas

1. **Schema primero si hay DB changes.** Diseñar el schema antes de planear endpoints.
2. **Plan, no código.** Este documento describe qué construir, no implementa.
3. **Constitución antes de proceder.** Si hay violación de principios sin justificación, no avanzar.
4. **Consistencia con spec.md.** Cada FR-### del spec debe tener correspondencia en el plan.

---

## Checklist de ejecución

- [ ] Leer `spec.md` completo
- [ ] Leer `specs/constitution.md`
- [ ] Identificar apps/paquetes afectados
- [ ] Diseñar schema Prisma si hay cambios de DB
- [ ] Definir endpoints y sus contratos
- [ ] Verificar cumplimiento de constitución
- [ ] Escribir `specs/NNN-feature-name/plan.md`
- [ ] Informar al usuario: plan creado, siguiente paso → `/speckit.tasks`
