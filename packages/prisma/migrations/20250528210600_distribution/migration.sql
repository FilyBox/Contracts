/*
  Warnings:

  - You are about to drop the column `artistName` on the `DistributionStatementTerritories` table. All the data in the column will be lost.
  - Added the required column `name` to the `DistributionStatementTerritories` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "DistributionStatementTerritories" DROP COLUMN "artistName",
ADD COLUMN     "name" TEXT NOT NULL;
