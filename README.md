# MegaCinemaSv

Online cinema ticket reservation and purchase platform. Browse listings, select seats, pay via Stripe, and receive a QR ticket for entry validation.

## Apps & Packages

```
apps/
  api/        NestJS REST API                   → :3001
  web/        Next.js 15 — customer site        → :3000
  admin/      Next.js 15 — admin dashboard      → :3002
packages/
  database/   Prisma schema + generated client
  ui/         Shared React component library (Tailwind v4)
  shared/     Shared TypeScript types and utilities
```

All packages use the `@cinema/*` scope.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| API | NestJS 10, TypeScript |
| Frontend | Next.js 15, React 19, Tailwind CSS v4 |
| Database | PostgreSQL via Supabase (Prisma ORM) |
| Auth | Supabase Auth (JWT) |
| Storage | Supabase Storage |
| Payments | Stripe Checkout |
| Monorepo | pnpm workspaces + Turborepo |

## Requirements

- Node.js >= 20
- pnpm >= 9

## Getting Started

### 1. Install dependencies

```bash
pnpm install
```

### 2. Configure environment

```bash
cp .env.example .env
```

Fill in the values — you need a [Supabase](https://supabase.com) project with:
- A PostgreSQL database
- Auth enabled
- A storage bucket named `cinema-storage`

And a [Stripe](https://stripe.com) account for payment processing.

### 3. Generate Prisma client

```bash
pnpm db:generate
```

### 4. Run in development

```bash
# All apps at once
pnpm dev

# Or individually
pnpm --filter @cinema/api dev      # API on :3001
pnpm --filter @cinema/web dev      # Customer site on :3000
pnpm --filter @cinema/admin dev    # Admin dashboard on :3002
```

## Common Commands

```bash
pnpm build          # Build all apps
pnpm test           # Run all tests
pnpm lint           # Type-check all packages
pnpm format         # Format with Prettier
pnpm db:generate    # Regenerate Prisma client after schema changes
```

Run a command for a single app:

```bash
pnpm --filter @cinema/api test:cov
pnpm --filter @cinema/web build
```

## Roles

| Action | Cliente | Employee | Admin |
|--------|---------|----------|-------|
| Browse listings | ✓ | ✓ | ✓ |
| Reserve seats | ✓ | — | ✓ |
| Purchase tickets | ✓ | — | ✓ |
| View history + QR | ✓ | ✓ | ✓ |
| Scan QR | — | ✓ | ✓ |
| Reschedule functions | — | ✓ | ✓ |
| View audit log | — | — | ✓ |
| Manage movies / halls / functions | — | — | ✓ |

## Purchase Flow

1. Login or register
2. Select branch → movie → showtime
3. Choose entry type (adulto / niño / adulto mayor) — max 5
4. Select seats (locked for 10 minutes)
5. Pay via Stripe Checkout
6. Receive QR ticket (visible in purchase history)
7. Employee scans QR at venue → marked as used

If payment fails, user can retry while the 10-minute seat lock is active. After expiry, seats are released and the purchase is cancelled. No refunds in the current version.

## Environment Variables

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | Supabase pooler URL (PgBouncer, port 6543) |
| `DIRECT_URL` | Supabase direct URL (port 5432) — for migrations |
| `SUPABASE_URL` | Supabase project URL |
| `SUPABASE_ANON_KEY` | Public anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key (server only) |
| `SUPABASE_STORAGE_BUCKET` | `cinema-storage` |
| `PORT` | API port (default `3001`) |
| `NEXT_PUBLIC_API_URL` | `http://localhost:3001/api` |
| `NEXT_PUBLIC_SUPABASE_URL` | Same as `SUPABASE_URL` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Same as anon key |
| `WEB_FRONTEND_URL` | Customer site URL (for CORS) |
| `ADMIN_FRONTEND_URL` | Admin dashboard URL (for CORS) |

## Docker (API)

Build from repo root:

```bash
docker build -f apps/api/Dockerfile -t cinema-api .
```

The Dockerfile uses `turbo prune` to produce a minimal image with only the packages needed by the API.

## Deployment

- **API** → Render (Docker)
- **apps/web** → Vercel
- **apps/admin** → Vercel
- CI/CD via GitHub Actions
