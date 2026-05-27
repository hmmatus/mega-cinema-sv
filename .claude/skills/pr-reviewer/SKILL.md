---
name: pr-reviewer
description: Usar cuando el usuario quiera monitorear PRs de GitHub que requieren su revisión. Corre cada 3 minutos y alerta si hay PRs pendientes de revisar.
version: 1.0.0
---

# PR Reviewer Monitor

Monitorea PRs que requieren tu revisión en `hmmatus/mega-cinema-sv` y alerta cuando hay acción pendiente.

## Cuándo aplicar

- "revisa mis PRs pendientes"
- "monitorea PRs que necesitan mi revisión"
- "corre el pr-reviewer"
- "activa el pr reviewer"

---

## Ejecución

Llama este skill vía `/loop`:

```
/loop 3m Check GitHub PRs requiring review from user hmmatus on repo hmmatus/mega-cinema-sv. Use /opt/homebrew/bin/gh full path. Steps: 1. List open non-draft PRs needing review: /opt/homebrew/bin/gh pr list --repo hmmatus/mega-cinema-sv --json number,title,reviewRequests,isDraft,url --jq '[.[] | select(.isDraft == false) | select(.reviewRequests[]?.login == "hmmatus")]'. 2. For each PR found, fetch review status: /opt/homebrew/bin/gh pr view <number> --repo hmmatus/mega-cinema-sv --json reviews,title,url. 3. Print summary table: PR number | title | URL | status (approved/changes_requested/awaiting_review). 4. If any PR has status awaiting_review, print bold alert: ACCIÓN REQUERIDA — PR #N está esperando tu revisión.
```

**IMPORTANTE:** Invocar el skill `loop` directamente con el prompt anterior. No ejecutar manualmente.

---

## Lógica de revisión manual (sin loop)

Si el usuario solo quiere un check único:

```bash
# 1. Listar PRs que requieren mi revisión
/opt/homebrew/bin/gh pr list \
  --repo hmmatus/mega-cinema-sv \
  --json number,title,reviewRequests,isDraft,url \
  --jq '[.[] | select(.isDraft == false) | select(.reviewRequests[]?.login == "hmmatus")]'

# 2. Para cada PR, ver estado de reviews
/opt/homebrew/bin/gh pr view <NUMBER> \
  --repo hmmatus/mega-cinema-sv \
  --json reviews,title,url,headRefName
```

### Estados posibles

| Estado | Significado |
|--------|-------------|
| `APPROVED` | PR aprobado |
| `CHANGES_REQUESTED` | Cambios solicitados |
| _(sin reviews)_ | Esperando primera revisión |

### Output esperado

```
## PRs Pendientes de Revisión — hmmatus/mega-cinema-sv

| # | Título | URL | Estado |
|---|--------|-----|--------|
| 12 | feat: add cinema listing | https://github.com/... | ⏳ Awaiting review |
| 15 | fix: seat expiry bug | https://github.com/... | ✅ Approved |

⚠️  ACCIÓN REQUERIDA: PR #12 esperando tu revisión.
```

Si no hay PRs: `No hay PRs pendientes de revisión.`

---

## Reglas

- Usar siempre path completo `/opt/homebrew/bin/gh`
- Solo reportar PRs que tengan `reviewRequests[]?.login == "hmmatus"`
- Excluir drafts (`isDraft == true`)
- Alertar claramente (`⚠️ ACCIÓN REQUERIDA`) cuando haya PRs sin revisar
- Si `gh` no está autenticado: `gh auth status` y reportar el error
