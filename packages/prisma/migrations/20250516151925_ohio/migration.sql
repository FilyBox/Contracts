/*
  Warnings:

  - You are about to drop the column `Catalog #` on the `lpm` table. All the data in the column will be lost.
  - You are about to drop the column `Label` on the `lpm` table. All the data in the column will be lost.
  - You are about to drop the column `Pre-Order Date` on the `lpm` table. All the data in the column will be lost.
  - You are about to drop the column `Pre-Order Type` on the `lpm` table. All the data in the column will be lost.
  - You are about to drop the column `Product Id` on the `lpm` table. All the data in the column will be lost.
  - You are about to drop the column `Publishers/Collection Societies` on the `lpm` table. All the data in the column will be lost.
  - You are about to drop the column `Writers/Composers` on the `lpm` table. All the data in the column will be lost.
  - The `Track Volume` column on the `lpm` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Added the required column `Catalog ` to the `lpm` table without a default value. This is not possible if the table is not empty.
  - Added the required column `PublishersCollection Societies` to the `lpm` table without a default value. This is not possible if the table is not empty.
  - Added the required column `WritersComposers` to the `lpm` table without a default value. This is not possible if the table is not empty.
  - Added the required column `label` to the `lpm` table without a default value. This is not possible if the table is not empty.
  - Added the required column `productId` to the `lpm` table without a default value. This is not possible if the table is not empty.
  - Made the column `Product Type` on table `lpm` required. This step will fail if there are existing NULL values in that column.
  - Made the column `Product Title` on table `lpm` required. This step will fail if there are existing NULL values in that column.
  - Made the column `Product Display Artist` on table `lpm` required. This step will fail if there are existing NULL values in that column.
  - Made the column `Release Date` on table `lpm` required. This step will fail if there are existing NULL values in that column.
  - Made the column `Product Genre` on table `lpm` required. This step will fail if there are existing NULL values in that column.
  - Made the column `Submission Status` on table `lpm` required. This step will fail if there are existing NULL values in that column.
  - Made the column `Product C Line` on table `lpm` required. This step will fail if there are existing NULL values in that column.
  - Made the column `Product P Line` on table `lpm` required. This step will fail if there are existing NULL values in that column.
  - Made the column `ExplicitLyrics` on table `lpm` required. This step will fail if there are existing NULL values in that column.
  - Made the column `Primary Metadata Language` on table `lpm` required. This step will fail if there are existing NULL values in that column.
  - Made the column `Last Process Date` on table `lpm` required. This step will fail if there are existing NULL values in that column.
  - Made the column `Import Date` on table `lpm` required. This step will fail if there are existing NULL values in that column.
  - Made the column `Created By` on table `lpm` required. This step will fail if there are existing NULL values in that column.
  - Made the column `Last Modified` on table `lpm` required. This step will fail if there are existing NULL values in that column.
  - Made the column `Submitted At` on table `lpm` required. This step will fail if there are existing NULL values in that column.
  - Made the column `TrackType` on table `lpm` required. This step will fail if there are existing NULL values in that column.
  - Made the column `Track Id` on table `lpm` required. This step will fail if there are existing NULL values in that column.
  - Made the column `Track Name` on table `lpm` required. This step will fail if there are existing NULL values in that column.
  - Made the column `Track Display Artist` on table `lpm` required. This step will fail if there are existing NULL values in that column.
  - Made the column `Isrc` on table `lpm` required. This step will fail if there are existing NULL values in that column.
  - Made the column `Track Genre` on table `lpm` required. This step will fail if there are existing NULL values in that column.
  - Made the column `Audio Language` on table `lpm` required. This step will fail if there are existing NULL values in that column.
  - Made the column `Track C Line` on table `lpm` required. This step will fail if there are existing NULL values in that column.
  - Made the column `Track P Line` on table `lpm` required. This step will fail if there are existing NULL values in that column.
  - Made the column `Withhold Mechanicals` on table `lpm` required. This step will fail if there are existing NULL values in that column.
  - Made the column `Duration` on table `lpm` required. This step will fail if there are existing NULL values in that column.
  - Made the column `Explicit Lyrics` on table `lpm` required. This step will fail if there are existing NULL values in that column.
  - Made the column `Album Only` on table `lpm` required. This step will fail if there are existing NULL values in that column.
  - Made the column `UPC` on table `lpm` required. This step will fail if there are existing NULL values in that column.
  - Made the column `Track Number` on table `lpm` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "lpm" DROP COLUMN "Catalog #",
DROP COLUMN "Label",
DROP COLUMN "Pre-Order Date",
DROP COLUMN "Pre-Order Type",
DROP COLUMN "Product Id",
DROP COLUMN "Publishers/Collection Societies",
DROP COLUMN "Writers/Composers",
ADD COLUMN     "AdditionalContributorsNonPerforming" TEXT,
ADD COLUMN     "AdditionalContributorsPerforming" TEXT,
ADD COLUMN     "Catalog " TEXT NOT NULL,
ADD COLUMN     "PreOrder Date" TEXT,
ADD COLUMN     "PreOrder Type" TEXT,
ADD COLUMN     "PublishersCollection Societies" TEXT NOT NULL,
ADD COLUMN     "WritersComposers" TEXT NOT NULL,
ADD COLUMN     "label" TEXT NOT NULL,
ADD COLUMN     "productId" TEXT NOT NULL,
ALTER COLUMN "Product Type" SET NOT NULL,
ALTER COLUMN "Product Title" SET NOT NULL,
ALTER COLUMN "Product Display Artist" SET NOT NULL,
ALTER COLUMN "Release Date" SET NOT NULL,
ALTER COLUMN "Product Genre" SET NOT NULL,
ALTER COLUMN "Submission Status" SET NOT NULL,
ALTER COLUMN "Product C Line" SET NOT NULL,
ALTER COLUMN "Product P Line" SET NOT NULL,
ALTER COLUMN "ExplicitLyrics" SET NOT NULL,
ALTER COLUMN "Primary Metadata Language" SET NOT NULL,
ALTER COLUMN "Last Process Date" SET NOT NULL,
ALTER COLUMN "Import Date" SET NOT NULL,
ALTER COLUMN "Created By" SET NOT NULL,
ALTER COLUMN "Last Modified" SET NOT NULL,
ALTER COLUMN "Submitted At" SET NOT NULL,
ALTER COLUMN "TrackType" SET NOT NULL,
ALTER COLUMN "Track Id" SET NOT NULL,
ALTER COLUMN "Track Name" SET NOT NULL,
ALTER COLUMN "Track Display Artist" SET NOT NULL,
ALTER COLUMN "Isrc" SET NOT NULL,
ALTER COLUMN "Track Genre" SET NOT NULL,
ALTER COLUMN "Audio Language" SET NOT NULL,
ALTER COLUMN "Track C Line" SET NOT NULL,
ALTER COLUMN "Track P Line" SET NOT NULL,
ALTER COLUMN "Withhold Mechanicals" SET NOT NULL,
ALTER COLUMN "Duration" SET NOT NULL,
ALTER COLUMN "Explicit Lyrics" SET NOT NULL,
ALTER COLUMN "Album Only" SET NOT NULL,
ALTER COLUMN "UPC" SET NOT NULL,
ALTER COLUMN "UPC" SET DATA TYPE TEXT,
DROP COLUMN "Track Volume",
ADD COLUMN     "Track Volume" BOOLEAN,
ALTER COLUMN "Track Number" SET NOT NULL,
ALTER COLUMN "Track Number" SET DATA TYPE TEXT;
