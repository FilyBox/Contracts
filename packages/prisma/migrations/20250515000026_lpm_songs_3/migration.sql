/*
  Warnings:

  - The primary key for the `lpm` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `Product Id` on the `lpm` table. All the data in the column will be lost.
  - Added the required column `productId` to the `lpm` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "lpm" DROP CONSTRAINT "lpm_pkey",
DROP COLUMN "Product Id",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD COLUMN     "productId" TEXT NOT NULL,
ADD CONSTRAINT "lpm_pkey" PRIMARY KEY ("id");
