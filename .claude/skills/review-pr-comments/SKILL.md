---
name: review-pr-comments
description: Usar cuando el usuario quiera revisar y actuar sobre comentarios de un PR de GitHub. Fetches todos los comentarios, presenta lista, pregunta cuáles aplicar, ejecuta cambios, y marca como resueltos en GitHub.
version: 1.0.0
---

# Review PR Comments

Flujo completo: leer comentarios → decidir cuáles aplicar → ejecutar cambios → resolver en GitHub.

## Cuándo aplicar

- "revisa los comentarios del PR"
- "actúa sobre el feedback del PR"
- "resuelve los comentarios del PR #X"

**Requisito:** número de PR o URL. Sin eso, pedirlo antes de continuar.

---

## Paso 1 — Fetch comentarios

```bash
# Review comments (inline, en líneas de código)
gh pr view <PR_NUMBER> --json reviews,reviewRequests
gh api repos/{owner}/{repo}/pulls/<PR_NUMBER>/comments \
  --jq '.[] | {id: .id, path: .path, line: .line, body: .body, user: .user.login, resolved: false}'

# Issue comments (comentarios generales en el hilo)
gh api repos/{owner}/{repo}/issues/<PR_NUMBER>/comments \
  --jq '.[] | {id: .id, body: .body, user: .user.login}'

# Review threads (para saber cuáles ya están resueltos)
gh api graphql -f query='
  query($owner: String!, $repo: String!, $pr: Int!) {
    repository(owner: $owner, name: $repo) {
      pullRequest(number: $pr) {
        reviewThreads(first: 50) {
          nodes {
            id
            isResolved
            comments(first: 5) {
              nodes { id body author { login } path line }
            }
          }
        }
      }
    }
  }
' -f owner="{owner}" -f repo="{repo}" -F pr=<PR_NUMBER>
```

Extraer `owner` y `repo` del remote:
```bash
gh repo view --json nameWithOwner -q .nameWithOwner
```

---

## Paso 2 — Entrar en Plan Mode y presentar lista

**OBLIGATORIO:** Llamar `EnterPlanMode` antes de mostrar cualquier lista.

Construir tabla con TODOS los comentarios no resueltos:

```
## Comentarios del PR #<N>

| # | Archivo | Línea | Autor | Comentario (resumen) | thread_id |
|---|---------|-------|-------|----------------------|-----------|
| 1 | src/foo.ts | 42 | alice | "rename variable X to Y" | thread_abc |
| 2 | src/bar.ts | 15 | bob | "add null check here" | thread_def |
| 3 | — (general) | — | carol | "update README" | comment_xyz |
...
```

Luego preguntar al usuario:

```
¿Cuáles aplicamos? Responde con números separados por coma, "todos", o "ninguno".
Ejemplo: "1,3,5" o "todos"
```

Usar `AskUserQuestion` con las opciones detectadas + "Todos" + "Ninguno" + "Otro".

---

## Paso 3 — Salir de Plan Mode y ejecutar

Llamar `ExitPlanMode` antes de ejecutar cualquier cambio.

Para cada comentario seleccionado:

1. **Leer contexto**: abrir el archivo en la línea indicada
2. **Entender el cambio**: interpretar el comentario en contexto real del código
3. **Aplicar**: editar con `Edit` o `Write`
4. **Verificar**: si hay tests relevantes, correrlos
5. **Marcar resuelto** (ver Paso 4)

Trabajar un comentario a la vez. No aplicar el siguiente hasta que el actual esté resuelto y marcado.

---

## Paso 4 — Resolver thread en GitHub

Después de aplicar cada cambio, resolver el thread vía GraphQL:

```bash
gh api graphql -f query='
  mutation($threadId: ID!) {
    resolveReviewThread(input: { threadId: $threadId }) {
      thread { isResolved }
    }
  }
' -f threadId="<THREAD_ID>"
```

Para comentarios generales (issue comments) no hay "resolve" nativo — simplemente continuar.

Si `gh` no está instalado o no autenticado:
```
gh not available. Resolve manually at: https://github.com/{owner}/{repo}/pull/<PR_NUMBER>
```

---

## Paso 5 — Commit y resumen

Después de aplicar todos los cambios seleccionados:

1. Commit con mensaje descriptivo:
   ```
   fix: address PR #<N> review comments

   - <resumen de cada cambio aplicado>
   ```
2. Push al branch del PR:
   ```bash
   git push
   ```
3. Presentar resumen final:
   ```
   ## Resumen
   ✅ Aplicados: #1, #3, #5 (resueltos en GitHub)
   ⏭️  Saltados: #2, #4
   ```

---

## Reglas

- **No aplicar** comentarios no seleccionados por el usuario
- **No resolver** en GitHub comentarios que el usuario decidió saltar
- Si un comentario es técnicamente incorrecto, explicar el razonamiento antes de saltarlo
- Si el cambio requerido no está claro, preguntar antes de implementar
- Un comentario que modifica lógica de negocio debe tener test actualizado o nuevo

## Dependencias

Requiere `gh` CLI autenticado (`gh auth status`). Si no está disponible, reportar al inicio y continuar sin el paso de resolve.
