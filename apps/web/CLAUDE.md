# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## @cinema/web — Customer-facing Next.js app

Port **3000**. Used by **Cliente** role: browse listings, select seats, checkout, view purchase history and QR tickets.

## Commands

```bash
pnpm --filter @cinema/web dev      # dev server on :3000
pnpm --filter @cinema/web build    # production build
pnpm --filter @cinema/web lint     # next lint
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

## Auth

Supabase Auth handles login/register/password-recovery client-side. Initialize Supabase client with `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY`. After login, include the session JWT in all API calls:

```typescript
const { data: { session } } = await supabase.auth.getSession();
// session.access_token → Authorization: Bearer <token>
```

Use Supabase's `onAuthStateChange` listener to keep session fresh. Protected routes should check session in a layout or middleware.

## Customer Flows to Implement

1. **Home / Cartelera** — movie listings filtered by branch; categories: estreno, preventa, cartelera, próximas
2. **Movie Detail** — poster, synopsis, showtime grid by day, link to reservation
3. **Reservation flow**:
   - Select entry type (adulto / niño / adulto mayor) — max 5 total
   - Select seats (real-time locked status from API)
   - Stripe Checkout redirect
   - Confirmation page with QR
4. **History** — past purchases with QR image; show scanned/used status

## Data Fetching Pattern

Use Server Components for listings (cartelera, movie detail) — no auth required, SSR-friendly. Use Client Components + `fetch` with bearer token for authenticated flows (reservation, history). Avoid mixing auth-dependent data in the same Server Component fetch.

## Stripe Checkout

Redirect to Stripe-hosted checkout page (no card fields on this app). On return:
- `?success=true` → show QR confirmation (verify via API webhook state, not URL param alone)
- `?canceled=true` → show retry option (reservation still valid if within 10-minute window)

## Seat Map UI

Seats must show real-time availability. Poll API or use Supabase Realtime subscription. Color states: Disponible (selectable), Bloqueado (gray), Reservado/Ocupado (red), Selected (highlighted).

## i18n

System supports Spanish and English. Use Next.js built-in i18n routing or a lightweight lib (e.g. `next-intl`). Default locale: `es`.
