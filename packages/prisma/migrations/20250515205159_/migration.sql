/*
  Warnings:

  - You are about to drop the column `userId` on the `Lpm` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Lpm" DROP CONSTRAINT "Lpm_userId_fkey";

-- AlterTable
ALTER TABLE "Lpm" DROP COLUMN "userId";
