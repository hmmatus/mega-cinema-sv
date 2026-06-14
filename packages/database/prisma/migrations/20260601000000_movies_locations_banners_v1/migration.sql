-- ============================================================
-- Migration: movies_locations_banners_v1
-- Date: 2026-06-01
-- ============================================================

-- ── Step 1: New enums ─────────────────────────────────────────

CREATE TYPE "movie_rating" AS ENUM ('G', 'PG', 'PG13', 'R', 'NC17');

CREATE TYPE "movie_visibility" AS ENUM ('PUBLIC', 'INTERNAL', 'HIDDEN');

CREATE TYPE "banner_status" AS ENUM ('ACTIVE', 'INACTIVE', 'DRAFT', 'SCHEDULED');

CREATE TYPE "banner_target_type" AS ENUM ('EXTERNAL', 'MOVIE', 'BRANCH', 'PROMOTION');

-- ── Step 2: Migrate MovieStatus data before rename ────────────
-- CARTELERA and ESTRENO both map to RELEASED; PREVENTA→PRERELEASE; PROXIMA→UPCOMING; INACTIVA→ARCHIVED
-- Temporarily cast using text to safely handle the rename

ALTER TYPE "movie_status" ADD VALUE IF NOT EXISTS 'UPCOMING';
ALTER TYPE "movie_status" ADD VALUE IF NOT EXISTS 'PRERELEASE';
ALTER TYPE "movie_status" ADD VALUE IF NOT EXISTS 'RELEASED';
ALTER TYPE "movie_status" ADD VALUE IF NOT EXISTS 'ARCHIVED';

UPDATE "movies" SET "status" = 'UPCOMING'::"movie_status"   WHERE "status" = 'PROXIMA'::"movie_status";
UPDATE "movies" SET "status" = 'PRERELEASE'::"movie_status" WHERE "status" = 'PREVENTA'::"movie_status";
UPDATE "movies" SET "status" = 'RELEASED'::"movie_status"   WHERE "status" IN ('ESTRENO'::"movie_status", 'CARTELERA'::"movie_status");
UPDATE "movies" SET "status" = 'ARCHIVED'::"movie_status"   WHERE "status" = 'INACTIVA'::"movie_status";

-- Remove old movie_status values: recreate enum with only new values
ALTER TABLE "movies" ALTER COLUMN "status" TYPE TEXT;
DROP TYPE "movie_status";
CREATE TYPE "movie_status" AS ENUM ('UPCOMING', 'PRERELEASE', 'RELEASED', 'ARCHIVED');
ALTER TABLE "movies" ALTER COLUMN "status" TYPE "movie_status" USING "status"::"movie_status";
ALTER TABLE "movies" ALTER COLUMN "status" SET DEFAULT 'UPCOMING'::"movie_status";

-- ── Step 3: Migrate BranchStatus data before rename ───────────

ALTER TYPE "branch_status" ADD VALUE IF NOT EXISTS 'ACTIVE';
ALTER TYPE "branch_status" ADD VALUE IF NOT EXISTS 'INACTIVE';

UPDATE "branches" SET "status" = 'ACTIVE'::"branch_status"   WHERE "status" = 'ACTIVA'::"branch_status";
UPDATE "branches" SET "status" = 'INACTIVE'::"branch_status" WHERE "status" = 'INACTIVA'::"branch_status";

ALTER TABLE "branches" ALTER COLUMN "status" TYPE TEXT;
DROP TYPE "branch_status";
CREATE TYPE "branch_status" AS ENUM ('ACTIVE', 'INACTIVE', 'CLOSED', 'MAINTENANCE');
ALTER TABLE "branches" ALTER COLUMN "status" TYPE "branch_status" USING "status"::"branch_status";
ALTER TABLE "branches" ALTER COLUMN "status" SET DEFAULT 'ACTIVE'::"branch_status";

-- ── Step 4: Expand movies table ───────────────────────────────

ALTER TABLE "movies"
  ADD COLUMN "rating"          "movie_rating",
  ADD COLUMN "director"        TEXT,
  ADD COLUMN "genres"          TEXT[]   NOT NULL DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN "cast"            TEXT[]   NOT NULL DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN "featured"        BOOLEAN  NOT NULL DEFAULT false,
  ADD COLUMN "visibility"      "movie_visibility" NOT NULL DEFAULT 'PUBLIC',
  ADD COLUMN "metadata"        JSONB,
  ADD COLUMN "created_by"      UUID REFERENCES "users"("id"),
  ADD COLUMN "updated_by"      UUID REFERENCES "users"("id");

CREATE INDEX "movies_status_visibility_idx" ON "movies"("status", "visibility");
CREATE INDEX "movies_featured_idx" ON "movies"("featured");

-- ── Step 5: Expand branches table ────────────────────────────

ALTER TABLE "branches"
  ADD COLUMN "description"      TEXT,
  ADD COLUMN "state"            VARCHAR(100),
  ADD COLUMN "postal_code"      VARCHAR(20),
  ADD COLUMN "country"          VARCHAR(100) NOT NULL DEFAULT 'El Salvador',
  ADD COLUMN "email"            VARCHAR,
  ADD COLUMN "latitude"         DOUBLE PRECISION,
  ADD COLUMN "longitude"        DOUBLE PRECISION,
  ADD COLUMN "operating_hours"  JSONB,
  ADD COLUMN "image_url"        TEXT,
  ADD COLUMN "features"         TEXT[]   NOT NULL DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN "metadata"         JSONB,
  ADD COLUMN "created_by"       UUID REFERENCES "users"("id"),
  ADD COLUMN "updated_by"       UUID REFERENCES "users"("id");

CREATE INDEX "branches_status_idx" ON "branches"("status");

-- ── Step 6: Add pendingResolution to reservations ─────────────

ALTER TABLE "reservations"
  ADD COLUMN "pending_resolution" BOOLEAN NOT NULL DEFAULT false;

-- ── Step 7: Create banners table ──────────────────────────────

CREATE TABLE "banners" (
  "id"               UUID         NOT NULL DEFAULT gen_random_uuid(),
  "title"            VARCHAR(255) NOT NULL,
  "description"      TEXT,
  "image_url"        TEXT         NOT NULL,
  "mobile_image_url" TEXT,
  "target_url"       TEXT,
  "target_type"      "banner_target_type" NOT NULL DEFAULT 'EXTERNAL',
  "target_id"        UUID,
  "position"         INTEGER      NOT NULL DEFAULT 0,
  "status"           "banner_status" NOT NULL DEFAULT 'DRAFT',
  "published_at"     TIMESTAMPTZ,
  "expires_at"       TIMESTAMPTZ,
  "metadata"         JSONB,
  "created_by"       UUID REFERENCES "users"("id"),
  "updated_by"       UUID REFERENCES "users"("id"),
  "created_at"       TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  "updated_at"       TIMESTAMPTZ  NOT NULL DEFAULT NOW(),

  CONSTRAINT "banners_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "banners_status_position_idx" ON "banners"("status", "position" ASC);
