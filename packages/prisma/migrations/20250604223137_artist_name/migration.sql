/*
  Warnings:

  - Made the column `name` on table `Artist` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Artist" ALTER COLUMN "name" SET NOT NULL;
