-- CreateEnum
CREATE TYPE "user_status" AS ENUM ('ACTIVE', 'INACTIVE', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "movie_status" AS ENUM ('CARTELERA', 'PREVENTA', 'ESTRENO', 'PROXIMA', 'INACTIVA');

-- CreateEnum
CREATE TYPE "showtime_status" AS ENUM ('PROGRAMADA', 'REPROGRAMADA', 'ACTIVA', 'FINALIZADA', 'CANCELADA');

-- CreateEnum
CREATE TYPE "seat_status" AS ENUM ('DISPONIBLE', 'BLOQUEADO', 'RESERVADO', 'OCUPADO');

-- CreateEnum
CREATE TYPE "reservation_status" AS ENUM ('PENDIENTE', 'BLOQUEADA', 'PAGADA', 'EXPIRADA', 'CANCELADA');

-- CreateEnum
CREATE TYPE "reservation_seat_status" AS ENUM ('BLOQUEADO', 'CONFIRMADO', 'LIBERADO');

-- CreateEnum
CREATE TYPE "payment_status" AS ENUM ('PENDIENTE', 'APROBADO', 'RECHAZADO', 'EXPIRADO');

-- CreateEnum
CREATE TYPE "qr_status" AS ENUM ('GENERADO', 'VALIDO', 'ESCANEADO', 'USADO', 'INVALIDO', 'EXPIRADO');

-- CreateEnum
CREATE TYPE "room_status" AS ENUM ('ACTIVA', 'INACTIVA', 'MANTENIMIENTO');

-- CreateEnum
CREATE TYPE "branch_status" AS ENUM ('ACTIVA', 'INACTIVA');

-- CreateEnum
CREATE TYPE "seat_type" AS ENUM ('ESTANDAR', 'VIP', 'PREFERENCIAL');

-- CreateEnum
CREATE TYPE "room_type" AS ENUM ('STANDARD', 'IMAX', 'TRES_D', 'CUATRO_DX');

-- CreateEnum
CREATE TYPE "adjustment_type" AS ENUM ('PORCENTAJE', 'FIJO');

-- CreateEnum
CREATE TYPE "ticket_type_status" AS ENUM ('ACTIVO', 'INACTIVO');

-- CreateTable
CREATE TABLE "roles" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "role_id" UUID NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT,
    "status" "user_status" NOT NULL DEFAULT 'ACTIVE',
    "preferred_language" TEXT NOT NULL DEFAULT 'es',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "branches" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "phone" TEXT,
    "status" "branch_status" NOT NULL DEFAULT 'ACTIVA',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "branches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rooms" (
    "id" UUID NOT NULL,
    "branch_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "capacity" INTEGER NOT NULL,
    "room_type" "room_type" NOT NULL DEFAULT 'STANDARD',
    "status" "room_status" NOT NULL DEFAULT 'ACTIVA',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "rooms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "seats" (
    "id" UUID NOT NULL,
    "room_id" UUID NOT NULL,
    "row_label" TEXT NOT NULL,
    "seat_number" INTEGER NOT NULL,
    "seat_type" "seat_type" NOT NULL DEFAULT 'ESTANDAR',
    "status" "seat_status" NOT NULL DEFAULT 'DISPONIBLE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "seats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "movies" (
    "id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "duration_minutes" INTEGER NOT NULL,
    "rating" TEXT,
    "original_language" TEXT,
    "status" "movie_status" NOT NULL DEFAULT 'CARTELERA',
    "release_date" DATE,
    "poster_url" TEXT,
    "trailer_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "movies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "showtimes" (
    "id" UUID NOT NULL,
    "movie_id" UUID NOT NULL,
    "room_id" UUID NOT NULL,
    "start_at" TIMESTAMP(3) NOT NULL,
    "end_at" TIMESTAMP(3) NOT NULL,
    "status" "showtime_status" NOT NULL DEFAULT 'PROGRAMADA',
    "base_price" DECIMAL(10,2) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "showtimes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ticket_types" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "adjustment_type" "adjustment_type" NOT NULL DEFAULT 'FIJO',
    "adjustment_value" DECIMAL(10,2) NOT NULL,
    "status" "ticket_type_status" NOT NULL DEFAULT 'ACTIVO',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ticket_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reservations" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "showtime_id" UUID NOT NULL,
    "status" "reservation_status" NOT NULL DEFAULT 'PENDIENTE',
    "total_tickets" INTEGER NOT NULL,
    "total_amount" DECIMAL(10,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "expires_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reservations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reservation_seats" (
    "id" UUID NOT NULL,
    "reservation_id" UUID NOT NULL,
    "seat_id" UUID NOT NULL,
    "status" "reservation_seat_status" NOT NULL DEFAULT 'BLOQUEADO',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reservation_seats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reservation_ticket_types" (
    "id" UUID NOT NULL,
    "reservation_id" UUID NOT NULL,
    "ticket_type_id" UUID NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unit_price" DECIMAL(10,2) NOT NULL,
    "subtotal" DECIMAL(10,2) NOT NULL,

    CONSTRAINT "reservation_ticket_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payments" (
    "id" UUID NOT NULL,
    "reservation_id" UUID NOT NULL,
    "provider" TEXT NOT NULL DEFAULT 'stripe',
    "provider_payment_id" TEXT,
    "amount" DECIMAL(10,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "status" "payment_status" NOT NULL DEFAULT 'PENDIENTE',
    "attempted_at" TIMESTAMP(3),
    "confirmed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ticket_qrs" (
    "id" UUID NOT NULL,
    "reservation_id" UUID NOT NULL,
    "qr_code" TEXT NOT NULL,
    "status" "qr_status" NOT NULL DEFAULT 'GENERADO',
    "generated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "used_at" TIMESTAMP(3),
    "scanned_by_user_id" UUID,

    CONSTRAINT "ticket_qrs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "role_id" UUID NOT NULL,
    "entity_name" TEXT NOT NULL,
    "entity_id" UUID NOT NULL,
    "action" TEXT NOT NULL,
    "previous_value" JSONB,
    "new_value" JSONB,
    "metadata" JSONB,
    "source_ip" TEXT,
    "event_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "roles_name_key" ON "roles"("name");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_role_id_idx" ON "users"("role_id");

-- CreateIndex
CREATE INDEX "rooms_branch_id_idx" ON "rooms"("branch_id");

-- CreateIndex
CREATE INDEX "seats_room_id_idx" ON "seats"("room_id");

-- CreateIndex
CREATE UNIQUE INDEX "seats_room_id_row_label_seat_number_key" ON "seats"("room_id", "row_label", "seat_number");

-- CreateIndex
CREATE INDEX "showtimes_movie_id_idx" ON "showtimes"("movie_id");

-- CreateIndex
CREATE INDEX "showtimes_room_id_idx" ON "showtimes"("room_id");

-- CreateIndex
CREATE UNIQUE INDEX "ticket_types_name_key" ON "ticket_types"("name");

-- CreateIndex
CREATE INDEX "reservations_user_id_idx" ON "reservations"("user_id");

-- CreateIndex
CREATE INDEX "reservations_showtime_id_idx" ON "reservations"("showtime_id");

-- CreateIndex
CREATE INDEX "reservation_seats_reservation_id_idx" ON "reservation_seats"("reservation_id");

-- CreateIndex
CREATE INDEX "reservation_seats_seat_id_idx" ON "reservation_seats"("seat_id");

-- CreateIndex
CREATE INDEX "reservation_ticket_types_reservation_id_idx" ON "reservation_ticket_types"("reservation_id");

-- CreateIndex
CREATE INDEX "reservation_ticket_types_ticket_type_id_idx" ON "reservation_ticket_types"("ticket_type_id");

-- CreateIndex
CREATE UNIQUE INDEX "payments_reservation_id_key" ON "payments"("reservation_id");

-- CreateIndex
CREATE UNIQUE INDEX "ticket_qrs_reservation_id_key" ON "ticket_qrs"("reservation_id");

-- CreateIndex
CREATE UNIQUE INDEX "ticket_qrs_qr_code_key" ON "ticket_qrs"("qr_code");

-- CreateIndex
CREATE INDEX "ticket_qrs_scanned_by_user_id_idx" ON "ticket_qrs"("scanned_by_user_id");

-- CreateIndex
CREATE INDEX "audit_logs_user_id_idx" ON "audit_logs"("user_id");

-- CreateIndex
CREATE INDEX "audit_logs_role_id_idx" ON "audit_logs"("role_id");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rooms" ADD CONSTRAINT "rooms_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "branches"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "seats" ADD CONSTRAINT "seats_room_id_fkey" FOREIGN KEY ("room_id") REFERENCES "rooms"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "showtimes" ADD CONSTRAINT "showtimes_movie_id_fkey" FOREIGN KEY ("movie_id") REFERENCES "movies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "showtimes" ADD CONSTRAINT "showtimes_room_id_fkey" FOREIGN KEY ("room_id") REFERENCES "rooms"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reservations" ADD CONSTRAINT "reservations_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reservations" ADD CONSTRAINT "reservations_showtime_id_fkey" FOREIGN KEY ("showtime_id") REFERENCES "showtimes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reservation_seats" ADD CONSTRAINT "reservation_seats_reservation_id_fkey" FOREIGN KEY ("reservation_id") REFERENCES "reservations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reservation_seats" ADD CONSTRAINT "reservation_seats_seat_id_fkey" FOREIGN KEY ("seat_id") REFERENCES "seats"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reservation_ticket_types" ADD CONSTRAINT "reservation_ticket_types_reservation_id_fkey" FOREIGN KEY ("reservation_id") REFERENCES "reservations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reservation_ticket_types" ADD CONSTRAINT "reservation_ticket_types_ticket_type_id_fkey" FOREIGN KEY ("ticket_type_id") REFERENCES "ticket_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_reservation_id_fkey" FOREIGN KEY ("reservation_id") REFERENCES "reservations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ticket_qrs" ADD CONSTRAINT "ticket_qrs_reservation_id_fkey" FOREIGN KEY ("reservation_id") REFERENCES "reservations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ticket_qrs" ADD CONSTRAINT "ticket_qrs_scanned_by_user_id_fkey" FOREIGN KEY ("scanned_by_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

