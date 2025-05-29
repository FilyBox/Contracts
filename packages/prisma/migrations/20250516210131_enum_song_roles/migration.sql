/*
  Warnings:

  - You are about to drop the column `roles` on the `Writers` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "songRoles" AS ENUM ('WRITER', 'COMPOSER', 'ARRANGER', 'PRODUCER', 'MIXER', 'MASTERING_ENGINEER');

-- AlterTable
ALTER TABLE "Writers" DROP COLUMN "roles",
ADD COLUMN     "songroles" "songRoles"[] DEFAULT ARRAY['WRITER']::"songRoles"[];
