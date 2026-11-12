/*
  Warnings:

  - A unique constraint covering the columns `[telegram_id]` on the table `accounts` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[first_name]` on the table `accounts` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "roles" AS ENUM ('USER', 'ADMIN');

-- AlterTable
ALTER TABLE "accounts" ADD COLUMN     "first_name" TEXT,
ADD COLUMN     "last_name" TEXT,
ADD COLUMN     "role" "roles" NOT NULL DEFAULT 'USER',
ADD COLUMN     "telegram_id" TEXT;

-- CreateTable
CREATE TABLE "pending_contract_changes" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "code_hash" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "account_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pending_contract_changes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "pending_contract_changes_account_id_type_key" ON "pending_contract_changes"("account_id", "type");

-- CreateIndex
CREATE UNIQUE INDEX "accounts_telegram_id_key" ON "accounts"("telegram_id");

-- CreateIndex
CREATE UNIQUE INDEX "accounts_first_name_key" ON "accounts"("first_name");

-- AddForeignKey
ALTER TABLE "pending_contract_changes" ADD CONSTRAINT "pending_contract_changes_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
