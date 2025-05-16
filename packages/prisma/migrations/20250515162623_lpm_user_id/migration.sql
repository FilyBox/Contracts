/*
  Warnings:

  - You are about to drop the `lpm` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "lpm";

-- CreateTable
CREATE TABLE "Lpm" (
    "id" SERIAL NOT NULL,
    "productId" TEXT NOT NULL,
    "Product Type" VARCHAR NOT NULL,
    "Product Title" VARCHAR NOT NULL,
    "Product Version" VARCHAR,
    "Product Display Artist" VARCHAR NOT NULL,
    "Parent Label" VARCHAR,
    "label" VARCHAR NOT NULL,
    "Original Release Date" VARCHAR,
    "Release Date" VARCHAR NOT NULL,
    "UPC" VARCHAR NOT NULL,
    "Catalog " VARCHAR NOT NULL,
    "Product Price Tier" VARCHAR,
    "Product Genre" VARCHAR NOT NULL,
    "Submission Status" VARCHAR NOT NULL,
    "Product C Line" VARCHAR NOT NULL,
    "Product P Line" VARCHAR NOT NULL,
    "PreOrder Date" VARCHAR,
    "Exclusives" VARCHAR,
    "ExplicitLyrics" VARCHAR NOT NULL,
    "Product Play Link" VARCHAR,
    "Liner Notes" VARCHAR,
    "Primary Metadata Language" VARCHAR NOT NULL,
    "Compilation" VARCHAR,
    "PDF Booklet" VARCHAR,
    "Timed Release Date" VARCHAR,
    "Timed Release Music Services" VARCHAR,
    "Last Process Date" VARCHAR NOT NULL,
    "Import Date" VARCHAR NOT NULL,
    "Created By" VARCHAR NOT NULL,
    "Last Modified" VARCHAR NOT NULL,
    "Submitted At" VARCHAR NOT NULL,
    "Submitted By" VARCHAR,
    "Vevo Channel" VARCHAR,
    "TrackType" VARCHAR NOT NULL,
    "Track Id" VARCHAR NOT NULL,
    "Track Volume" BOOLEAN,
    "Track Number" VARCHAR NOT NULL,
    "Track Name" VARCHAR NOT NULL,
    "Track Version" VARCHAR,
    "Track Display Artist" VARCHAR NOT NULL,
    "Isrc" VARCHAR NOT NULL,
    "Track Price Tier" VARCHAR,
    "Track Genre" VARCHAR NOT NULL,
    "Audio Language" VARCHAR NOT NULL,
    "Track C Line" VARCHAR NOT NULL,
    "Track P Line" VARCHAR NOT NULL,
    "WritersComposers" VARCHAR NOT NULL,
    "PublishersCollection Societies" VARCHAR NOT NULL,
    "Withhold Mechanicals" VARCHAR NOT NULL,
    "PreOrder Type" VARCHAR,
    "Instant Gratification Date" VARCHAR,
    "Duration" VARCHAR NOT NULL,
    "Sample Start Time" VARCHAR,
    "Explicit Lyrics" VARCHAR NOT NULL,
    "Album Only" VARCHAR NOT NULL,
    "Lyrics" VARCHAR,
    "AdditionalContributorsPerforming" VARCHAR,
    "AdditionalContributorsNonPerforming" VARCHAR,
    "Producers" VARCHAR,
    "Continuous Mix" VARCHAR,
    "Continuously Mixed Individual Song" VARCHAR,
    "Track Play Link" VARCHAR,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "Lpm_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Lpm" ADD CONSTRAINT "Lpm_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
