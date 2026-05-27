---
name: speckit.tasks
description: Descompone el plan técnico de una feature en tareas ejecutables. Usar después de tener plan.md listo. Genera specs/NNN-feature-name/tasks.md con lista priorizada, dependencias y marcado de tareas paralelizables.
version: 1.0.0
source: spec-kit
---

# speckit.tasks — Descomponer en Tareas

Genera `specs/NNN-feature-name/tasks.md` a partir de `spec.md` + `plan.md`.

## Cuándo aplicar

- El usuario tiene `spec.md` y `plan.md` listos
- Antes de implementar

**Requisito obligatorio:** debe existir `plan.md`. Sin plan, pedir `/speckit.plan` primero.

---

## Paso 1 — Leer spec + plan

```bash
cat specs/NNN-feature-name/spec.md
cat specs/NNN-feature-name/plan.md
```

## Paso 2 — Identificar unidades de trabajo

Descomponer por capa del monorepo:
- Schema / migraciones
- Módulo API (module, controller, service, DTOs)
- Tests API
- Schema Zod + tipos frontend
- Data layer (TanStack Query hooks)
- Componentes UI
- Tests frontend
- Integración E2E (si aplica)

## Paso 3 — Generar tasks.md

```markdown
---
feature: [Nombre]
spec: specs/[NNN-feature-name]/spec.md
plan: specs/[NNN-feature-name]/plan.md
status: pending
created: [YYYY-MM-DD]
---

# Tasks: [Nombre de la Feature]

## Progreso

0 / N completadas

---

## Fase 0 — Fundación (requisito para todo lo demás)

- [ ] T-001: Actualizar schema Prisma — agregar [modelos/campos] en `packages/database/prisma/schema.prisma`
- [ ] T-002: `pnpm db:generate` — regenerar cliente Prisma tras cambio de schema [depende: T-001]

> Si no hay cambios de schema, omitir Fase 0.

---

## Fase 1 — Backend (`apps/api`) [P]

> Las tareas marcadas [P] dentro de la misma fase son paralelizables una vez que sus dependencias están completas.

- [ ] T-010: Crear módulo NestJS `[feature].module.ts` [depende: T-002]
- [ ] T-011 [P]: Crear `[feature].controller.ts` con endpoints [depende: T-010]
- [ ] T-012 [P]: Crear `[feature].service.ts` con lógica de negocio [depende: T-010]
- [ ] T-013 [P]: Crear DTOs de request/response [depende: T-010]
- [ ] T-014: Registrar módulo en `app.module.ts` [depende: T-011, T-012, T-013]
- [ ] T-015 [P]: Tests unitarios del service [depende: T-012]
- [ ] T-016 [P]: Tests de integración del controller [depende: T-014]

---

## Fase 2 — Frontend Data Layer (`apps/web`) [P]

> Paralelizable con Fase 1 en lo que no depende de endpoints reales.

- [ ] T-020 [P]: Schemas Zod + tipos en `src/domains/[feature]/schemas/index.ts` [puede empezar con T-010]
- [ ] T-021 [P]: Query keys factory en `src/domains/[feature]/consts/keys.ts` [depende: T-020]
- [ ] T-022 [P]: Query hooks en `src/domains/[feature]/services/queries/` [depende: T-020, T-021]
- [ ] T-023 [P]: Mutation hooks en `src/domains/[feature]/services/mutations/` [depende: T-020, T-021]

---

## Fase 3 — UI Components (`apps/web`) [P]

> Paralelizable dentro de la fase. Depende de Fase 2.

- [ ] T-030 [P]: Componente [ComponenteA] — types, viewmodel, tsx [depende: T-022]
- [ ] T-031 [P]: Componente [ComponenteB] — types, viewmodel, tsx [depende: T-022]
- [ ] T-032: Página/ruta [ruta] integrando componentes [depende: T-030, T-031]

---

## Fase 4 — Admin (`apps/admin`) [P]

> Solo si aplica.

- [ ] T-040 [P]: [Tarea admin específica] [depende: Fase 1]

---

## Fase 5 — Verificación Final

- [ ] T-050: `pnpm lint` — sin errores de tipos
- [ ] T-051: `pnpm test` — todos los tests pasan
- [ ] T-052: Smoke test manual en dev local
- [ ] T-053: Actualizar `status: done` en spec.md y plan.md

---

## Leyenda

- `[P]` = tarea paralelizable con otras [P] de la misma fase
- `[depende: T-NNN]` = no empezar hasta que T-NNN esté completada
- Marcar completadas reemplazando `[ ]` con `[x]`
```

---

## Reglas

1. **Granularidad útil.** Cada tarea = 1 archivo o 1 concepto cohesivo. No "implementar toda la feature" como tarea única.
2. **Dependencias explícitas.** Si una tarea no puede empezar sin otra, anotarlo.
3. **Paralelismo marcado.** `[P]` solo dentro de la misma fase. Entre fases siempre secuencial salvo excepción justificada.
4. **Schema siempre Fase 0.** Nunca mover schema changes a mitad de otras fases.
5. **Verificación siempre al final.** `pnpm lint` + `pnpm test` son el gate final.

---

## Checklist de ejecución

- [ ] Leer `plan.md` completo
- [ ] Identificar fases según el stack (api / data layer / ui / admin)
- [ ] Asignar IDs T-NNN secuenciales
- [ ] Marcar paralelismo [P] con cuidado — solo si realmente no hay dependencia
- [ ] Escribir `specs/NNN-feature-name/tasks.md`
- [ ] Informar al usuario: tasks creadas, siguiente paso → `/speckit.implement`
