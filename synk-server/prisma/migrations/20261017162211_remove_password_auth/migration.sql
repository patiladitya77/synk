/*
  Warnings:

  - The values [password] on the enum `AuthType` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `otpAttempts` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `resetOtp` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `resetOtpExpiry` on the `User` table. All the data in the column will be lost.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "AuthType_new" AS ENUM ('google');
ALTER TABLE "AuthProvider" ALTER COLUMN "provider" TYPE "AuthType_new" USING ("provider"::text::"AuthType_new");
ALTER TYPE "AuthType" RENAME TO "AuthType_old";
ALTER TYPE "AuthType_new" RENAME TO "AuthType";
DROP TYPE "public"."AuthType_old";
COMMIT;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "otpAttempts",
DROP COLUMN "resetOtp",
DROP COLUMN "resetOtpExpiry";
