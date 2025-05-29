-- AlterTable
ALTER TABLE "Lpm" ADD COLUMN     "writersId" INTEGER;

-- CreateTable
CREATE TABLE "Writers" (
    "id" SERIAL NOT NULL,
    "name" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "teamId" INTEGER,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "roles" "Role"[] DEFAULT ARRAY['USER']::"Role"[],
    "avatarImageId" TEXT,
    "disabled" BOOLEAN DEFAULT false,
    "url" TEXT,

    CONSTRAINT "Writers_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Writers_url_key" ON "Writers"("url");

-- AddForeignKey
ALTER TABLE "Lpm" ADD CONSTRAINT "Lpm_writersId_fkey" FOREIGN KEY ("writersId") REFERENCES "Writers"("id") ON DELETE CASCADE ON UPDATE CASCADE;
