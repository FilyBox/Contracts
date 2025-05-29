-- CreateTable
CREATE TABLE "IsrcSongs" (
    "id" SERIAL NOT NULL,
    "date" TEXT,
    "isrc" TEXT,
    "artist" TEXT,
    "duration" TEXT,
    "title" TEXT,
    "license" TEXT,

    CONSTRAINT "IsrcSongs_pkey" PRIMARY KEY ("id")
);
