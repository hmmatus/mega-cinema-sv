---
name: speckit.specify
description: Crea un documento de especificación SDD para una nueva feature. Usar cuando el usuario quiera planear o documentar una nueva funcionalidad antes de implementarla. Genera specs/NNN-feature-name/spec.md con escenarios de usuario, requisitos funcionales, entidades clave, criterios de éxito y casos borde.
version: 1.0.0
source: spec-kit
---

# speckit.specify — Crear Especificación de Feature

Genera `specs/NNN-feature-name/spec.md` siguiendo el patrón SDD (Spec-Driven Development).

## Cuándo aplicar

- Usuario pide documentar o planear una nueva feature
- Antes de cualquier implementación de feature significativa
- Obligatorio para features que toquen: pagos, QR, máquina de estados de asientos, auth

---

## Paso 1 — Determinar número de feature

```bash
ls specs/ | grep -E '^[0-9]' | sort | tail -1
```

Siguiente número = último + 1 con cero padding (001, 002, ...). Si `specs/` no existe, crear y empezar en `001`.

## Paso 2 — Generar slug de la carpeta

Formato: `NNN-nombre-en-kebab-case`  
Ejemplo: `003-seat-selection-ui`

## Paso 3 — Recolectar información

Antes de escribir el spec, preguntar al usuario (si no lo especificó):
1. ¿Quién es el usuario principal de esta feature? (Cliente / Employee / Admin)
2. ¿Qué problema resuelve?
3. ¿Hay restricciones de dominio específicas conocidas?

Si el usuario ya dio suficiente contexto, inferir y marcar dudas con `[NEEDS CLARIFICATION]`.

## Paso 4 — Crear spec.md

```markdown
---
feature: [Nombre de la feature]
branch: feat/[slug]
status: draft
created: [YYYY-MM-DD]
---

# [Nombre de la Feature]

## Resumen

[2-3 oraciones describiendo QUÉ hace la feature y POR QUÉ existe.]

---

## Escenarios de Usuario

Formato: `Given [contexto], When [acción], Then [resultado]`  
Prioridad: P1 = crítico, P2 = importante, P3 = nice-to-have

### [EU-001] [P1] [Título del escenario]
- **Given:** [estado inicial del sistema/usuario]
- **When:** [acción que realiza el usuario]
- **Then:** [resultado esperado]
- **And:** [resultado adicional si aplica]

### [EU-002] [P2] [Título del escenario]
...

---

## Requisitos Funcionales

Formato: `FR-NNN: El sistema DEBE/PUEDE [comportamiento]`

| ID | Prioridad | Requisito |
|----|-----------|-----------|
| FR-001 | MUST | El sistema DEBE [comportamiento] |
| FR-002 | MUST | El sistema DEBE [comportamiento] |
| FR-003 | SHOULD | El sistema DEBERÍA [comportamiento] |

---

## Entidades Clave

| Entidad | Atributos relevantes | Notas |
|---------|---------------------|-------|
| [Entidad] | [campo1, campo2] | [relación con otras entidades] |

**Estados relevantes del dominio:**
[Referencia a la máquina de estados de specs/constitution.md si aplica]

---

## Criterios de Éxito

| ID | Criterio | Cómo medir |
|----|----------|------------|
| SC-001 | [Outcome medible] | [Métricas / test] |
| SC-002 | [Outcome medible] | [Métricas / test] |

---

## Casos Borde

- [ ] [Escenario límite 1]
- [ ] [Escenario límite 2]
- [ ] [NEEDS CLARIFICATION] [Item que necesita aclaración del usuario]

---

## Suposiciones

- [Suposición 1 — qué asumimos que es verdad]
- [Suposición 2]

---

## Dependencias

- [ ] [Otra feature o servicio del que depende]
- [ ] [Paquete externo si aplica]

---

## Fuera de Alcance (MVP)

- [Cosa que deliberadamente NO incluimos]
```

---

## Reglas del patrón

1. **Spec primero, código después.** Nunca proponer implementación dentro de un spec.
2. **"MUST" vs "SHOULD"**: usar MUST solo para requisitos sin los que la feature no funciona.
3. **Marcar ambigüedades.** Todo lo incierto lleva `[NEEDS CLARIFICATION]`. Nunca asumir silenciosamente.
4. **Respetar dominio.** Verificar contra reglas de CLAUDE.md y `specs/constitution.md` (máx 5 tickets, expiración 10 min, etc.)
5. **Escenarios concretos.** "When el usuario selecciona un asiento" no "When el usuario interactúa con el UI".

---

## Checklist de ejecución

- [ ] `ls specs/` — determinar número NNN
- [ ] Preguntar al usuario si falta contexto crítico (rol, problema, restricciones)
- [ ] Crear directorio `specs/NNN-feature-name/`
- [ ] Escribir `specs/NNN-feature-name/spec.md` con todas las secciones
- [ ] Marcar dudas con `[NEEDS CLARIFICATION]`
- [ ] Verificar que los requisitos sean consistentes con las reglas de dominio (CLAUDE.md + constitution.md)
- [ ] Informar al usuario: spec creado, siguiente paso → `/speckit.clarify` o `/speckit.plan`
