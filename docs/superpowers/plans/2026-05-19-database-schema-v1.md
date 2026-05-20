# Database Schema V1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create branch `feat/back-database-v1`, replace the starter Prisma schema with the full MegaCinemaSv domain model from the product spec, and generate the initial migration SQL.

**Architecture:** All tables live in a single PostgreSQL schema (public) managed by Prisma. Status fields use Prisma enums mapped to PostgreSQL strings. All PKs are UUIDs. Monetary values use `Decimal(10,2)`. JSON columns (`previousValue`, `newValue`, `metadata` in `AuditLog`) use Prisma's `Json` type.

**Tech Stack:** Prisma 5, PostgreSQL (Supabase), pnpm workspaces, `packages/database` package.

---

## File Map

| File | Action | Purpose |
|------|--------|---------|
| `packages/database/prisma/schema.prisma` | Modify (full rewrite) | Add all enums and 14 domain models |
| `packages/database/src/index.ts` | Modify | Export all new model types |
| `packages/database/prisma/migrations/` | Create (auto-generated) | Migration SQL produced by `prisma migrate dev` |

---

## Task 1: Create the feature branch

- [ ] **Step 1: Create and check out branch**

```bash
git checkout -b feat/back-database-v1
```

Expected: `Switched to a new branch 'feat/back-database-v1'`

- [ ] **Step 2: Verify branch**

```bash
git branch --show-current
```

Expected: `feat/back-database-v1`

---

## Task 2: Write enums in schema.prisma

**Files:**
- Modify: `packages/database/prisma/schema.prisma`

The current schema has one starter `User` model. Replace the entire contents with the datasource/generator block plus all enums. Models come in later tasks.

- [ ] **Step 1: Overwrite schema.prisma with generator + datasource + all enums**

Replace the full contents of `packages/database/prisma/schema.prisma` with:

```prisma
generator client {
  provider = "prisma-client-js"
  output   = "../src/generated/client"
}

datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}

// ─── Enums ───────────────────────────────────────────────────────────────────

enum UserStatus {
  ACTIVE
  INACTIVE
  SUSPENDED

  @@map("user_status")
}

enum MovieStatus {
  CARTELERA
  PREVENTA
  ESTRENO
  PROXIMA
  INACTIVA

  @@map("movie_status")
}

enum ShowtimeStatus {
  PROGRAMADA
  REPROGRAMADA
  ACTIVA
  FINALIZADA
  CANCELADA

  @@map("showtime_status")
}

enum SeatStatus {
  DISPONIBLE
  BLOQUEADO
  RESERVADO
  OCUPADO

  @@map("seat_status")
}

enum ReservationStatus {
  PENDIENTE
  BLOQUEADA
  PAGADA
  EXPIRADA
  CANCELADA

  @@map("reservation_status")
}

enum ReservationSeatStatus {
  BLOQUEADO
  CONFIRMADO
  LIBERADO

  @@map("reservation_seat_status")
}

enum PaymentStatus {
  PENDIENTE
  APROBADO
  RECHAZADO
  EXPIRADO

  @@map("payment_status")
}

enum QRStatus {
  GENERADO
  VALIDO
  ESCANEADO
  USADO
  INVALIDO
  EXPIRADO

  @@map("qr_status")
}

enum RoomStatus {
  ACTIVA
  INACTIVA
  MANTENIMIENTO

  @@map("room_status")
}

enum BranchStatus {
  ACTIVA
  INACTIVA

  @@map("branch_status")
}

enum SeatType {
  ESTANDAR
  VIP
  PREFERENCIAL

  @@map("seat_type")
}

enum RoomType {
  STANDARD
  IMAX
  TRES_D
  CUATRO_DX

  @@map("room_type")
}

enum AdjustmentType {
  PORCENTAJE
  FIJO

  @@map("adjustment_type")
}

enum TicketTypeStatus {
  ACTIVO
  INACTIVO

  @@map("ticket_type_status")
}
```

- [ ] **Step 2: Validate enums compile**

```bash
cd /path/to/repo && pnpm --filter @cinema/database exec prisma validate --schema=./prisma/schema.prisma
```

Expected error: `Error: At least one model must be present in the schema.`  
This is correct — no models yet. The enums themselves are valid.

---

## Task 3: Add core identity models (Role, User)

**Files:**
- Modify: `packages/database/prisma/schema.prisma` (append after enums)

- [ ] **Step 1: Append Role and User models to schema.prisma**

Add at the end of the file:

```prisma
// ─── Models ──────────────────────────────────────────────────────────────────

model Role {
  id          String   @id @default(uuid()) @db.Uuid
  name        String   @unique
  description String?
  createdAt   DateTime @default(now()) @map("created_at")

  users     User[]
  auditLogs AuditLog[]

  @@map("roles")
}

model User {
  id                String     @id @default(uuid()) @db.Uuid
  roleId            String     @map("role_id") @db.Uuid
  firstName         String     @map("first_name")
  lastName          String     @map("last_name")
  email             String     @unique
  passwordHash      String?    @map("password_hash")
  status            UserStatus @default(ACTIVE)
  preferredLanguage String     @default("es") @map("preferred_language")
  createdAt         DateTime   @default(now()) @map("created_at")
  updatedAt         DateTime   @updatedAt @map("updated_at")

  role             Role              @relation(fields: [roleId], references: [id])
  reservations     Reservation[]
  auditLogs        AuditLog[]
  scannedTicketQRs TicketQR[]        @relation("ScannedBy")

  @@map("users")
}
```

- [ ] **Step 2: Validate (expect failure — forward refs not resolved yet)**

```bash
pnpm --filter @cinema/database exec prisma validate --schema=./prisma/schema.prisma
```

Expected: error about unknown types `Reservation`, `AuditLog`, `TicketQR` — this is expected, models are added in later tasks.

---

## Task 4: Add venue models (Branch, Room, Seat)

**Files:**
- Modify: `packages/database/prisma/schema.prisma` (append)

- [ ] **Step 1: Append Branch, Room, Seat models**

```prisma
model Branch {
  id        String       @id @default(uuid()) @db.Uuid
  name      String
  address   String
  city      String
  phone     String?
  status    BranchStatus @default(ACTIVA)
  createdAt DateTime     @default(now()) @map("created_at")
  updatedAt DateTime     @updatedAt @map("updated_at")

  rooms Room[]

  @@map("branches")
}

model Room {
  id        String     @id @default(uuid()) @db.Uuid
  branchId  String     @map("branch_id") @db.Uuid
  name      String
  capacity  Int
  roomType  RoomType   @default(STANDARD) @map("room_type")
  status    RoomStatus @default(ACTIVA)
  createdAt DateTime   @default(now()) @map("created_at")
  updatedAt DateTime   @updatedAt @map("updated_at")

  branch    Branch     @relation(fields: [branchId], references: [id])
  seats     Seat[]
  showtimes Showtime[]

  @@map("rooms")
}

model Seat {
  id         String     @id @default(uuid()) @db.Uuid
  roomId     String     @map("room_id") @db.Uuid
  rowLabel   String     @map("row_label")
  seatNumber Int        @map("seat_number")
  seatType   SeatType   @default(ESTANDAR) @map("seat_type")
  status     SeatStatus @default(DISPONIBLE)
  createdAt  DateTime   @default(now()) @map("created_at")

  room             Room              @relation(fields: [roomId], references: [id])
  reservationSeats ReservationSeat[]

  @@unique([roomId, rowLabel, seatNumber])
  @@map("seats")
}
```

---

## Task 5: Add content models (Movie, Showtime, TicketType)

**Files:**
- Modify: `packages/database/prisma/schema.prisma` (append)

- [ ] **Step 1: Append Movie, Showtime, TicketType models**

```prisma
model Movie {
  id              String      @id @default(uuid()) @db.Uuid
  title           String
  description     String?
  durationMinutes Int         @map("duration_minutes")
  rating          String?
  originalLanguage String?    @map("original_language")
  status          MovieStatus @default(CARTELERA)
  releaseDate     DateTime?   @map("release_date") @db.Date
  posterUrl       String?     @map("poster_url")
  trailerUrl      String?     @map("trailer_url")
  createdAt       DateTime    @default(now()) @map("created_at")
  updatedAt       DateTime    @updatedAt @map("updated_at")

  showtimes Showtime[]

  @@map("movies")
}

model Showtime {
  id        String         @id @default(uuid()) @db.Uuid
  movieId   String         @map("movie_id") @db.Uuid
  roomId    String         @map("room_id") @db.Uuid
  startAt   DateTime       @map("start_at")
  endAt     DateTime       @map("end_at")
  status    ShowtimeStatus @default(PROGRAMADA)
  basePrice Decimal        @map("base_price") @db.Decimal(10, 2)
  createdAt DateTime       @default(now()) @map("created_at")
  updatedAt DateTime       @updatedAt @map("updated_at")

  movie        Movie         @relation(fields: [movieId], references: [id])
  room         Room          @relation(fields: [roomId], references: [id])
  reservations Reservation[]

  @@map("showtimes")
}

model TicketType {
  id              String           @id @default(uuid()) @db.Uuid
  name            String           @unique
  description     String?
  adjustmentType  AdjustmentType   @default(FIJO) @map("adjustment_type")
  adjustmentValue Decimal          @map("adjustment_value") @db.Decimal(10, 2)
  status          TicketTypeStatus @default(ACTIVO)
  createdAt       DateTime         @default(now()) @map("created_at")

  reservationTicketTypes ReservationTicketType[]

  @@map("ticket_types")
}
```

---

## Task 6: Add reservation models (Reservation, ReservationSeat, ReservationTicketType)

**Files:**
- Modify: `packages/database/prisma/schema.prisma` (append)

- [ ] **Step 1: Append reservation models**

```prisma
model Reservation {
  id           String            @id @default(uuid()) @db.Uuid
  userId       String            @map("user_id") @db.Uuid
  showtimeId   String            @map("showtime_id") @db.Uuid
  status       ReservationStatus @default(PENDIENTE)
  totalTickets Int               @map("total_tickets")
  totalAmount  Decimal           @map("total_amount") @db.Decimal(10, 2)
  currency     String            @default("USD")
  expiresAt    DateTime          @map("expires_at")
  createdAt    DateTime          @default(now()) @map("created_at")
  updatedAt    DateTime          @updatedAt @map("updated_at")

  user                   User                    @relation(fields: [userId], references: [id])
  showtime               Showtime                @relation(fields: [showtimeId], references: [id])
  reservationSeats       ReservationSeat[]
  reservationTicketTypes ReservationTicketType[]
  payment                Payment?
  ticketQR               TicketQR?

  @@map("reservations")
}

model ReservationSeat {
  id            String                @id @default(uuid()) @db.Uuid
  reservationId String                @map("reservation_id") @db.Uuid
  seatId        String                @map("seat_id") @db.Uuid
  status        ReservationSeatStatus @default(BLOQUEADO)
  createdAt     DateTime              @default(now()) @map("created_at")

  reservation Reservation @relation(fields: [reservationId], references: [id])
  seat        Seat        @relation(fields: [seatId], references: [id])

  @@map("reservation_seats")
}

model ReservationTicketType {
  id            String  @id @default(uuid()) @db.Uuid
  reservationId String  @map("reservation_id") @db.Uuid
  ticketTypeId  String  @map("ticket_type_id") @db.Uuid
  quantity      Int
  unitPrice     Decimal @map("unit_price") @db.Decimal(10, 2)
  subtotal      Decimal @db.Decimal(10, 2)

  reservation Reservation @relation(fields: [reservationId], references: [id])
  ticketType  TicketType  @relation(fields: [ticketTypeId], references: [id])

  @@map("reservation_ticket_types")
}
```

---

## Task 7: Add payment, QR, and audit models

**Files:**
- Modify: `packages/database/prisma/schema.prisma` (append)

- [ ] **Step 1: Append Payment, TicketQR, AuditLog models**

```prisma
model Payment {
  id                String        @id @default(uuid()) @db.Uuid
  reservationId     String        @unique @map("reservation_id") @db.Uuid
  provider          String        @default("stripe")
  providerPaymentId String?       @map("provider_payment_id")
  amount            Decimal       @db.Decimal(10, 2)
  currency          String        @default("USD")
  status            PaymentStatus @default(PENDIENTE)
  attemptedAt       DateTime?     @map("attempted_at")
  confirmedAt       DateTime?     @map("confirmed_at")
  createdAt         DateTime      @default(now()) @map("created_at")

  reservation Reservation @relation(fields: [reservationId], references: [id])

  @@map("payments")
}

model TicketQR {
  id              String    @id @default(uuid()) @db.Uuid
  reservationId   String    @unique @map("reservation_id") @db.Uuid
  qrCode          String    @unique @map("qr_code")
  status          QRStatus  @default(GENERADO)
  generatedAt     DateTime  @default(now()) @map("generated_at")
  usedAt          DateTime? @map("used_at")
  scannedByUserId String?   @map("scanned_by_user_id") @db.Uuid

  reservation   Reservation @relation(fields: [reservationId], references: [id])
  scannedByUser User?       @relation("ScannedBy", fields: [scannedByUserId], references: [id])

  @@map("ticket_qrs")
}

model AuditLog {
  id            String   @id @default(uuid()) @db.Uuid
  userId        String   @map("user_id") @db.Uuid
  roleId        String   @map("role_id") @db.Uuid
  entityName    String   @map("entity_name")
  entityId      String   @map("entity_id") @db.Uuid
  action        String
  previousValue Json?    @map("previous_value")
  newValue      Json?    @map("new_value")
  metadata      Json?
  sourceIp      String?  @map("source_ip")
  eventAt       DateTime @default(now()) @map("event_at")

  user User @relation(fields: [userId], references: [id])
  role Role @relation(fields: [roleId], references: [id])

  @@map("audit_logs")
}
```

---

## Task 8: Validate the full schema

**Files:**
- Read: `packages/database/prisma/schema.prisma`

- [ ] **Step 1: Run prisma validate**

```bash
pnpm --filter @cinema/database exec prisma validate --schema=./prisma/schema.prisma
```

Expected: `The schema at packages/database/prisma/schema.prisma is valid!`

If you get an error, check:
- All forward-referenced model names match exactly (case-sensitive: `Reservation`, `AuditLog`, `TicketQR`, `ReservationSeat`, `ReservationTicketType`, `Payment`, `Showtime`, `Room`, `Seat`, `User`, `Role`, `TicketType`, `Movie`, `Branch`)
- Each `@relation` `fields` array points to existing column names in the same model
- Each `@relation` `references` array points to fields that exist on the related model

---

## Task 9: Generate the Prisma client

**Files:**
- Auto-generated: `packages/database/src/generated/client/`

- [ ] **Step 1: Generate client**

```bash
pnpm --filter @cinema/database db:generate
```

Expected output ends with: `✔ Generated Prisma Client` (no TypeScript errors)

- [ ] **Step 2: Verify TypeScript types compile**

```bash
pnpm --filter @cinema/database lint
```

Expected: no errors

---

## Task 10: Update src/index.ts exports

**Files:**
- Modify: `packages/database/src/index.ts`

- [ ] **Step 1: Replace index.ts with exports for all new types**

Replace `packages/database/src/index.ts` with:

```typescript
export { PrismaClient } from './generated/client';
export type { Prisma } from './generated/client';

// Identity
export type { Role, User } from './generated/client';

// Venue
export type { Branch, Room, Seat } from './generated/client';

// Content
export type { Movie, Showtime, TicketType } from './generated/client';

// Reservations & payments
export type {
  Reservation,
  ReservationSeat,
  ReservationTicketType,
  Payment,
  TicketQR,
} from './generated/client';

// Audit
export type { AuditLog } from './generated/client';

// Enums
export {
  UserStatus,
  MovieStatus,
  ShowtimeStatus,
  SeatStatus,
  SeatType,
  RoomStatus,
  RoomType,
  BranchStatus,
  ReservationStatus,
  ReservationSeatStatus,
  PaymentStatus,
  QRStatus,
  AdjustmentType,
  TicketTypeStatus,
} from './generated/client';
```

- [ ] **Step 2: Verify exports compile**

```bash
pnpm --filter @cinema/database lint
```

Expected: no errors

- [ ] **Step 3: Commit schema + exports**

```bash
git add packages/database/prisma/schema.prisma packages/database/src/index.ts
git commit -m "feat(database): define full domain schema — 14 models, 14 enums"
```

---

## Task 11: Create the Prisma migration

> **Prerequisite:** `.env` at repo root must have valid `DATABASE_URL` and `DIRECT_URL` pointing to a live Supabase PostgreSQL instance. If not configured, this task will fail with a connection error. Configure `.env` from `.env.example` before continuing.

- [ ] **Step 1: Verify DB connection**

```bash
pnpm --filter @cinema/database exec prisma db execute --stdin --schema=./prisma/schema.prisma <<< "SELECT 1;"
```

Expected: `Result: [ { '?column?': 1 } ]`

If this fails with `Can't reach database server`, update `DIRECT_URL` in `.env`.

- [ ] **Step 2: Create migration (generates SQL without applying)**

```bash
pnpm --filter @cinema/database exec prisma migrate dev --name init-cinema-schema --schema=./prisma/schema.prisma
```

Expected:
```
Applying migration `20260519XXXXXX_init_cinema_schema`
The following migration(s) have been created and applied from new schema changes:
migrations/
  └─ 20260519XXXXXX_init_cinema_schema/
       └─ migration.sql
✔ Generated Prisma Client
```

- [ ] **Step 3: Inspect the generated migration.sql**

```bash
cat packages/database/prisma/migrations/*/migration.sql | head -60
```

Verify you see `CREATE TABLE "roles"`, `CREATE TABLE "users"`, `CREATE TABLE "branches"`, etc.

- [ ] **Step 4: Commit migration**

```bash
git add packages/database/prisma/migrations/
git commit -m "feat(database): add initial migration — init-cinema-schema"
```

---

## Task 12: Push branch and open PR

- [ ] **Step 1: Push branch**

```bash
git push -u origin feat/back-database-v1
```

Expected: branch appears on remote.

- [ ] **Step 2: Create PR**

```bash
gh pr create \
  --base main \
  --head feat/back-database-v1 \
  --title "feat(database): full domain schema v1 — 14 models" \
  --body "$(cat <<'EOF'
## Summary

- Replace starter `User` model with full MegaCinemaSv domain schema
- 14 Prisma models: Role, User, Branch, Room, Seat, Movie, Showtime, TicketType, Reservation, ReservationSeat, ReservationTicketType, Payment, TicketQR, AuditLog
- 14 enums covering all entity status values and type categories
- All PKs are UUIDs, monetary fields use Decimal(10,2), audit JSON uses Prisma Json type
- `@@unique([roomId, rowLabel, seatNumber])` prevents duplicate seats per room
- `Payment` and `TicketQR` use `@unique` on `reservationId` (1:1 with Reservation)
- `index.ts` exports all types and enums for consumer packages

## Test plan

- [ ] `prisma validate` passes with no errors
- [ ] `pnpm db:generate` produces TypeScript client without type errors
- [ ] `pnpm --filter @cinema/database lint` passes
- [ ] Migration SQL creates all 14 tables with correct FK constraints
- [ ] `@@unique` on seats prevents inserting duplicate (room, row, number) combination

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

Expected: PR URL printed to terminal.

---

## Self-Review Checklist

### Spec coverage

| Requirement | Task |
|------------|------|
| Users with role (cliente, employee, admin) | Task 3 — `Role`, `User` |
| Sucursales (branches) | Task 4 — `Branch` |
| Salas (rooms) with sucursalId | Task 4 — `Room` with `branchId` |
| Asientos per sala with unique constraint | Task 4 — `Seat` + `@@unique` |
| Películas with status (cartelera/preventa/estreno/proxima) | Task 5 — `Movie`, `MovieStatus` enum |
| Funciones (showtimes) linking película + sala | Task 5 — `Showtime` |
| Tipo entrada (adulto/niño/adulto mayor) with price adjustment | Task 5 — `TicketType` |
| Reserva with 10-min expiry field, status states | Task 6 — `Reservation.expiresAt`, `ReservationStatus` |
| Max 5 tickets enforced at app layer (not DB) | N/A — enforced in API service |
| Reserva-Asiento link (many seats per reservation) | Task 6 — `ReservationSeat` |
| Multiple ticket types per reservation | Task 6 — `ReservationTicketType` |
| Pago with Stripe provider_payment_id | Task 7 — `Payment` |
| 1 QR per compra, scanned_by tracking | Task 7 — `TicketQR` |
| Auditoría with previousValue, newValue, userId, roleId | Task 7 — `AuditLog` |
| Currency USD field on Reservation | Task 6 — `currency @default("USD")` |
| QR states (GENERADO→VÁLIDO→USADO) | Task 2 — `QRStatus` enum |
| Seat states (DISPONIBLE→BLOQUEADO→RESERVADO→OCUPADO) | Task 2 — `SeatStatus` enum |
| Función states (PROGRAMADA→REPROGRAMADA→ACTIVA→FINALIZADA→CANCELADA) | Task 2 — `ShowtimeStatus` |
