---
name: speckit.implement
description: Ejecuta las tareas de una feature SDD según spec.md + plan.md + tasks.md. Usar cuando los tres documentos estén listos. Trabaja tarea por tarea en orden de dependencias, marca completadas, y verifica al final.
version: 1.0.0
source: spec-kit
---

# speckit.implement — Ejecutar Implementación

Ejecuta `specs/NNN-feature-name/tasks.md` tarea por tarea respetando el spec y el plan.

## Cuándo aplicar

- Los tres documentos existen: `spec.md`, `plan.md`, `tasks.md`
- No hay `[NEEDS CLARIFICATION]` sin resolver en el spec

**Pre-check obligatorio:**
```bash
grep -r "\[NEEDS CLARIFICATION\]" specs/NNN-feature-name/
```
Si hay resultados, pedir `/speckit.clarify` primero.

---

## Protocolo de ejecución

### Por cada tarea

1. Leer la tarea de `tasks.md`
2. Leer las secciones relevantes de `plan.md` y `spec.md`
3. Implementar
4. Verificar que el código compila (`pnpm lint` o `tsc --noEmit` en el paquete)
5. Marcar `[x]` en `tasks.md`
6. Actualizar "Progreso" en `tasks.md`

### Orden de ejecución

Respetar siempre el orden de fases (0 → 1 → 2 → 3 → 4 → 5).  
Dentro de una fase, ejecutar tareas `[P]` en la misma iteración cuando sea posible.

---

## Reglas de implementación

### API (`apps/api`)

- Módulos NestJS: `feature.module.ts` → `feature.controller.ts` → `feature.service.ts`
- Guards: `@UseGuards(JwtAuthGuard)` en todos los endpoints protegidos
- Decoradores: `@CurrentUser()` para acceder al usuario autenticado
- PrismaService: inyectar por constructor, no instanciar directamente
- DTOs: usar `class-validator` para validación
- Roles: verificar que Employee no acceda a datos de pago

### Database

- **Siempre correr `pnpm db:generate` tras cambio de schema**
- Nunca importar desde `packages/database/src/generated/` directamente — usar `@cinema/database`
- Migrations: crear con `pnpm --filter @cinema/database prisma migrate dev --name [nombre]`

### Frontend (`apps/web`, `apps/admin`)

- Componentes: seguir patrón MVVM (ver skill `mvvm-component`)
- Data layer: seguir patrón domain-api (ver skill `domain-api`)
- Validar responses con Zod `.parse()`

### Invariantes de dominio (NUNCA violar)

- Máx 5 tickets por compra
- Expiración de reserva: 10 minutos
- Sin reembolsos en MVP
- Cada compra → exactamente 1 QR
- Employee no ve datos de tarjeta/pago

---

## Al terminar todas las tareas

```bash
pnpm lint          # sin errores de tipos
pnpm test          # todos los tests pasan
```

Si pasa:
1. Actualizar `status: done` en frontmatter de `spec.md` y `plan.md`
2. Actualizar `status: completed` en `tasks.md`
3. Informar al usuario que la implementación está completa

Si falla:
- Investigar el error
- Corregir antes de marcar la tarea como completa
- **No marcar `[x]` hasta que el código funcione**

---

## Checklist de ejecución

- [ ] Pre-check: sin `[NEEDS CLARIFICATION]` sin resolver
- [ ] Leer `tasks.md` completo para entender el scope total
- [ ] Ejecutar Fase 0 (schema) si aplica — correr `pnpm db:generate`
- [ ] Ejecutar fases en orden, marcando `[x]` por tarea
- [ ] Verificar compilación tras cada archivo modificado
- [ ] Al terminar: `pnpm lint` + `pnpm test` en verde
- [ ] Actualizar `status: done` en spec.md y plan.md
