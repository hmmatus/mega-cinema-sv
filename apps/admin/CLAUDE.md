# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## @cinema/admin — Admin & Employee Dashboard

Port **3002**. Serves two roles with different permissions:

| Feature | Employee | Admin |
|---------|----------|-------|
| QR scanner | ✓ | ✓ |
| Reschedule functions | ✓ | ✓ |
| View audit log | — | ✓ |
| Manage movies/halls/functions | — | ✓ |
| View all purchases | — | ✓ |
| Dashboard + metrics | — | ✓ |

Employees **cannot** see card or payment details at any point.

## Commands

```bash
pnpm --filter @cinema/admin dev     # dev server on :3002
pnpm --filter @cinema/admin build   # production build
pnpm --filter @cinema/admin lint    # next lint
```

## Tech Stack

- Next.js 15 (App Router)
- React 19
- Tailwind CSS v4
- `@cinema/ui` — shared component library
- `@cinema/shared` — shared types/utils

## Key Environment Variables

```
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

## Auth & Role Gating

Same Supabase Auth flow as `apps/web`. After login, check user role from Supabase user metadata or a roles endpoint on the API. Gate route access in Next.js middleware or layout Server Components:

- `role === 'admin'` → full access
- `role === 'employee'` → only QR scanner + reschedule views
- No role / `role === 'cliente'` → redirect to login or access denied

## Modules to Implement

### Employee

**QR Scanner** — web-based camera QR scanner (use `html5-qrcode` or `@zxing/library`). On scan:
1. POST `/api/tickets/scan` with QR value + employee JWT
2. API marks QR as `Usado`, writes audit entry
3. Show green (valid) or red (already used / invalid) result

**Reschedule functions** — form to change a function's time. On submit:
1. PATCH `/api/functions/:id` with new datetime
2. API records audit log (`oldValue`, `newValue`, `employeeId`)

### Admin

**Dashboard** — metrics: total sales, revenue (USD), active functions, seat occupancy rate.

**Movie management** — CRUD for movies. Movie poster upload goes to Supabase Storage bucket `cinema-storage`.

**Hall management** — CRUD for salas (halls) linked to branches via `sucursalId`.

**Function management** — create/edit showings. Prevent time overlaps in same hall (validate on API side).

**Audit log** — read-only table: employee, action, entity, old value, new value, timestamp. No edits allowed.

**Purchase review** — list of all purchases with status. Filter by date, function, branch. Never display card details — show only masked payment reference from Stripe.

## Audit Trail

Every mutating Employee action must trigger an audit write on the API. This app should not write audit records directly to DB — always go through the API so the server-side enforces the rule.
