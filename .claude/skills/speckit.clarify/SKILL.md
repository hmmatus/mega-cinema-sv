---
name: speckit.clarify
description: Resuelve ambigüedades marcadas con [NEEDS CLARIFICATION] en un spec SDD. Usar cuando spec.md tiene items sin resolver antes de pasar a plan o implement. Genera preguntas estructuradas, recibe respuestas del usuario, y actualiza el spec.
version: 1.0.0
source: spec-kit
---

# speckit.clarify — Resolver Ambigüedades

Busca todos los `[NEEDS CLARIFICATION]` en `spec.md` y los resuelve con el usuario.

## Cuándo aplicar

- Antes de `/speckit.plan` si hay dudas en el spec
- Antes de `/speckit.implement` si quedaron items sin resolver
- El usuario dice "hay cosas que no quedan claras en el spec"

---

## Paso 1 — Escanear ambigüedades

```bash
grep -n "\[NEEDS CLARIFICATION\]" specs/NNN-feature-name/spec.md
```

Listar todos los items encontrados con número de línea.

## Paso 2 — Categorizar

Agrupar por tipo:
- **Requisito de negocio** — necesita decisión del PO/usuario
- **Caso borde** — necesita política de manejo
- **Técnico** — puede resolverse investigando el codebase
- **Dependencia externa** — requiere info de terceros

Los **técnicos** intentar resolverlos consultando el código antes de preguntar.

## Paso 3 — Resolver técnicos primero

Para items técnicos:
```bash
grep -r "[término relevante]" apps/ packages/
```

Si se puede inferir del código, resolverlo y marcar la aclaración directamente.

## Paso 4 — Presentar preguntas al usuario

Formato de presentación:

```
Encontré N items que necesitan aclaración en specs/[NNN-feature-name]/spec.md:

**1. [Descripción del item — línea X]**
Contexto: [por qué esto importa para el spec]
¿[Pregunta concreta]?

**2. [Descripción del item — línea Y]**
...
```

Regla: una pregunta por item. Concreta. Sin ambigüedades en la pregunta misma.

## Paso 5 — Actualizar spec.md

Por cada respuesta recibida:
1. Reemplazar `[NEEDS CLARIFICATION] [item]` con la especificación aclarada
2. Si la respuesta genera nuevos requisitos, agregarlos a la sección correspondiente
3. Si descarta un caso borde, moverlo a "Fuera de Alcance"

## Paso 6 — Confirmar

```bash
grep -c "\[NEEDS CLARIFICATION\]" specs/NNN-feature-name/spec.md
```

Debe retornar `0`. Si quedan items, repetir proceso.

---

## Reglas

1. **No asumir en silencio.** Mejor preguntar que implementar algo incorrecto.
2. **Resolver técnicos primero.** Evita molestar al usuario con preguntas que el código ya responde.
3. **Una pregunta, una respuesta.** No agrupar múltiples preguntas en una sola.
4. **Actualizar el spec, no solo la conversación.** La aclaración debe quedar escrita.

---

## Checklist de ejecución

- [ ] `grep -n "\[NEEDS CLARIFICATION\]" spec.md` — listar todos
- [ ] Categorizar: negocio / caso borde / técnico / dependencia externa
- [ ] Resolver los técnicos consultando el codebase
- [ ] Presentar preguntas al usuario agrupadas por contexto
- [ ] Actualizar spec.md con las respuestas
- [ ] Verificar que no queden `[NEEDS CLARIFICATION]` sin resolver
- [ ] Informar: spec listo, siguiente paso → `/speckit.plan`
