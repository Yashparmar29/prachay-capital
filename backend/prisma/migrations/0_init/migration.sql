-- CreateEnum
CREATE TYPE "Role" AS ENUM ('EMPLOYEE', 'DIRECTOR', 'ACCOUNTS');

-- CreateEnum
CREATE TYPE "ExpenseCategory" AS ENUM ('Travel', 'Food', 'Accommodation', 'Office Supplies', 'Software', 'Training', 'Other');

-- CreateEnum
CREATE TYPE "VoucherStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'PENDING_APPROVAL', 'APPROVED', 'REJECTED');

-- CreateTable users
CREATE TABLE "users" (
    "id" VARCHAR(36) NOT NULL PRIMARY KEY,
    "name" VARCHAR(255) NOT NULL,
    "email" VARCHAR(255) NOT NULL UNIQUE,
    "password_hash" VARCHAR(255) NOT NULL,
    "role" "Role" NOT NULL,
    "employee_code" VARCHAR(50),
    "department" VARCHAR(100) NOT NULL,
    "signature_path" VARCHAR(500),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable vouchers
CREATE TABLE "vouchers" (
    "id" VARCHAR(36) NOT NULL PRIMARY KEY,
    "voucher_number" VARCHAR(50) NOT NULL UNIQUE,
    "voucher_date" DATE NOT NULL DEFAULT CURRENT_DATE,
    "expense_date" DATE NOT NULL,
    "department" VARCHAR(100) NOT NULL,
    "expense_title" VARCHAR(255) NOT NULL,
    "expense_category" "ExpenseCategory" NOT NULL,
    "expense_description" TEXT NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL CHECK ("amount" > 0),
    "employee_id" VARCHAR(36) NOT NULL REFERENCES "users"("id") ON DELETE RESTRICT,
    "employee_name" VARCHAR(255) NOT NULL,
    "employee_code" VARCHAR(50),
    "employee_signature_path" VARCHAR(500),
    "status" "VoucherStatus" NOT NULL DEFAULT 'DRAFT',
    "director_id" VARCHAR(36) REFERENCES "users"("id") ON DELETE SET NULL,
    "director_signature_path" VARCHAR(500),
    "approval_date" TIMESTAMP(3),
    "rejection_reason" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable voucher_status_history
CREATE TABLE "voucher_status_history" (
    "id" VARCHAR(36) NOT NULL PRIMARY KEY,
    "voucher_id" VARCHAR(36) NOT NULL REFERENCES "vouchers"("id") ON DELETE CASCADE,
    "from_status" "VoucherStatus" NOT NULL,
    "to_status" "VoucherStatus" NOT NULL,
    "changed_by" VARCHAR(36) NOT NULL REFERENCES "users"("id") ON DELETE RESTRICT,
    "remarks" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable voucher_counters
CREATE TABLE "voucher_counters" (
    "year" INTEGER NOT NULL PRIMARY KEY,
    "last_count" INTEGER NOT NULL DEFAULT 0
);

-- CreateIndexes
CREATE INDEX "vouchers_status_idx" ON "vouchers"("status");
CREATE INDEX "vouchers_employee_id_idx" ON "vouchers"("employee_id");
CREATE INDEX "vouchers_expense_date_idx" ON "vouchers"("expense_date");
CREATE INDEX "vouchers_voucher_number_idx" ON "vouchers"("voucher_number");
CREATE INDEX "voucher_status_history_voucher_id_idx" ON "voucher_status_history"("voucher_id");
