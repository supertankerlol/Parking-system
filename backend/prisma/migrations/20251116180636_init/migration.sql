-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('customer', 'admin', 'operator');

-- CreateEnum
CREATE TYPE "ParkingType" AS ENUM ('indoor', 'outdoor', 'street');

-- CreateEnum
CREATE TYPE "SpotType" AS ENUM ('standard', 'compact', 'disabled', 'ev-charging', 'motorcycle');

-- CreateEnum
CREATE TYPE "SpotStatus" AS ENUM ('available', 'occupied', 'reserved', 'maintenance', 'disabled');

-- CreateEnum
CREATE TYPE "BookingStatus" AS ENUM ('pending', 'confirmed', 'active', 'completed', 'cancelled', 'no-show');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('card', 'cash', 'wallet', 'bank_transfer');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('pending', 'processing', 'completed', 'failed', 'refunded', 'cancelled');

-- CreateTable
CREATE TABLE "refresh_tokens" (
    "id" SERIAL NOT NULL,
    "token" TEXT NOT NULL,
    "user_id" INTEGER NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "refresh_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "user_id" SERIAL NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "password_hash" VARCHAR(255) NOT NULL,
    "first_name" VARCHAR(100) NOT NULL,
    "last_name" VARCHAR(100) NOT NULL,
    "phone_number" VARCHAR(20),
    "role" "UserRole" NOT NULL DEFAULT 'customer',
    "is_verified" BOOLEAN NOT NULL DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "last_login" TIMESTAMP(3),

    CONSTRAINT "users_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "parking_lots" (
    "lot_id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "address" TEXT NOT NULL,
    "city" VARCHAR(100) NOT NULL,
    "country" VARCHAR(100) NOT NULL DEFAULT 'Kazakhstan',
    "latitude" DECIMAL(10,8),
    "longitude" DECIMAL(11,8),
    "type" "ParkingType" NOT NULL DEFAULT 'indoor',
    "description" TEXT,
    "total_floors" INTEGER NOT NULL DEFAULT 1,
    "hourly_rate" DECIMAL(10,2) NOT NULL,
    "daily_rate" DECIMAL(10,2),
    "opening_time" TIME NOT NULL DEFAULT '00:00:00'::time,
    "closing_time" TIME NOT NULL DEFAULT '23:59:59'::time,
    "is_24_hours" BOOLEAN NOT NULL DEFAULT true,
    "has_ev_charging" BOOLEAN NOT NULL DEFAULT false,
    "has_disabled_spots" BOOLEAN NOT NULL DEFAULT false,
    "has_covered_parking" BOOLEAN NOT NULL DEFAULT false,
    "has_security" BOOLEAN NOT NULL DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "parking_lots_pkey" PRIMARY KEY ("lot_id")
);

-- CreateTable
CREATE TABLE "parking_spots" (
    "spot_id" SERIAL NOT NULL,
    "lot_id" INTEGER NOT NULL,
    "spot_number" VARCHAR(20) NOT NULL,
    "floor_level" VARCHAR(20) NOT NULL,
    "spot_type" "SpotType" NOT NULL DEFAULT 'standard',
    "status" "SpotStatus" NOT NULL DEFAULT 'available',
    "row_position" INTEGER,
    "col_position" INTEGER,
    "has_cover" BOOLEAN NOT NULL DEFAULT false,
    "has_ev_charger" BOOLEAN NOT NULL DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "parking_spots_pkey" PRIMARY KEY ("spot_id")
);

-- CreateTable
CREATE TABLE "bookings" (
    "booking_id" SERIAL NOT NULL,
    "booking_reference" VARCHAR(50) NOT NULL,
    "user_id" INTEGER NOT NULL,
    "lot_id" INTEGER NOT NULL,
    "spot_id" INTEGER NOT NULL,
    "start_time" TIMESTAMP(3) NOT NULL,
    "end_time" TIMESTAMP(3) NOT NULL,
    "actual_start_time" TIMESTAMP(3),
    "actual_end_time" TIMESTAMP(3),
    "hourly_rate" DECIMAL(10,2) NOT NULL,
    "duration_hours" DECIMAL(10,2) NOT NULL,
    "total_amount" DECIMAL(10,2) NOT NULL,
    "vehicle_plate_number" VARCHAR(20),
    "vehicle_type" VARCHAR(50),
    "status" "BookingStatus" NOT NULL DEFAULT 'pending',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "cancelled_at" TIMESTAMP(3),

    CONSTRAINT "bookings_pkey" PRIMARY KEY ("booking_id")
);

-- CreateTable
CREATE TABLE "payments" (
    "payment_id" SERIAL NOT NULL,
    "payment_reference" VARCHAR(50) NOT NULL,
    "booking_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "currency" VARCHAR(3) NOT NULL DEFAULT 'USD',
    "payment_method" "PaymentMethod" NOT NULL DEFAULT 'card',
    "card_last_four" VARCHAR(4),
    "card_brand" VARCHAR(20),
    "cardholder_name" VARCHAR(255),
    "status" "PaymentStatus" NOT NULL DEFAULT 'pending',
    "transaction_id" VARCHAR(255),
    "payment_gateway" VARCHAR(50) NOT NULL DEFAULT 'stripe',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processed_at" TIMESTAMP(3),
    "failed_at" TIMESTAMP(3),
    "refunded_at" TIMESTAMP(3),
    "error_message" TEXT,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("payment_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "refresh_tokens_token_key" ON "refresh_tokens"("token");

-- CreateIndex
CREATE INDEX "refresh_tokens_user_id_idx" ON "refresh_tokens"("user_id");

-- CreateIndex
CREATE INDEX "refresh_tokens_token_idx" ON "refresh_tokens"("token");

-- CreateIndex
CREATE INDEX "refresh_tokens_expires_at_idx" ON "refresh_tokens"("expires_at");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_role_idx" ON "users"("role");

-- CreateIndex
CREATE INDEX "parking_lots_city_idx" ON "parking_lots"("city");

-- CreateIndex
CREATE INDEX "parking_lots_type_idx" ON "parking_lots"("type");

-- CreateIndex
CREATE INDEX "parking_lots_is_active_idx" ON "parking_lots"("is_active");

-- CreateIndex
CREATE INDEX "parking_spots_lot_id_idx" ON "parking_spots"("lot_id");

-- CreateIndex
CREATE INDEX "parking_spots_status_idx" ON "parking_spots"("status");

-- CreateIndex
CREATE INDEX "parking_spots_floor_level_idx" ON "parking_spots"("floor_level");

-- CreateIndex
CREATE INDEX "parking_spots_spot_type_idx" ON "parking_spots"("spot_type");

-- CreateIndex
CREATE UNIQUE INDEX "parking_spots_lot_id_spot_number_key" ON "parking_spots"("lot_id", "spot_number");

-- CreateIndex
CREATE UNIQUE INDEX "bookings_booking_reference_key" ON "bookings"("booking_reference");

-- CreateIndex
CREATE INDEX "bookings_user_id_idx" ON "bookings"("user_id");

-- CreateIndex
CREATE INDEX "bookings_lot_id_idx" ON "bookings"("lot_id");

-- CreateIndex
CREATE INDEX "bookings_spot_id_idx" ON "bookings"("spot_id");

-- CreateIndex
CREATE INDEX "bookings_status_idx" ON "bookings"("status");

-- CreateIndex
CREATE INDEX "bookings_start_time_idx" ON "bookings"("start_time");

-- CreateIndex
CREATE INDEX "bookings_booking_reference_idx" ON "bookings"("booking_reference");

-- CreateIndex
CREATE UNIQUE INDEX "payments_payment_reference_key" ON "payments"("payment_reference");

-- CreateIndex
CREATE UNIQUE INDEX "payments_booking_id_key" ON "payments"("booking_id");

-- CreateIndex
CREATE INDEX "payments_booking_id_idx" ON "payments"("booking_id");

-- CreateIndex
CREATE INDEX "payments_user_id_idx" ON "payments"("user_id");

-- CreateIndex
CREATE INDEX "payments_status_idx" ON "payments"("status");

-- CreateIndex
CREATE INDEX "payments_payment_reference_idx" ON "payments"("payment_reference");

-- CreateIndex
CREATE INDEX "payments_transaction_id_idx" ON "payments"("transaction_id");

-- AddForeignKey
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "parking_spots" ADD CONSTRAINT "parking_spots_lot_id_fkey" FOREIGN KEY ("lot_id") REFERENCES "parking_lots"("lot_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_lot_id_fkey" FOREIGN KEY ("lot_id") REFERENCES "parking_lots"("lot_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_spot_id_fkey" FOREIGN KEY ("spot_id") REFERENCES "parking_spots"("spot_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "bookings"("booking_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;
