/*
  Warnings:

  - You are about to drop the column `anneeEtude` on the `unites` table. All the data in the column will be lost.
  - You are about to drop the column `emplacement` on the `unites` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "unites" DROP COLUMN "anneeEtude",
DROP COLUMN "emplacement";

-- CreateTable
CREATE TABLE "instituts" (
    "id" TEXT NOT NULL,
    "emplacement" TEXT NOT NULL,
    "anneeEtude" INTEGER,
    "specialite" TEXT,
    "dateCreation" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "uniteId" TEXT NOT NULL,

    CONSTRAINT "instituts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dcts" (
    "id" TEXT NOT NULL,
    "domaine" TEXT,
    "niveau" TEXT,
    "dateCreation" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "uniteId" TEXT NOT NULL,

    CONSTRAINT "dcts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pcs" (
    "id" TEXT NOT NULL,
    "typePC" TEXT,
    "zoneOperation" TEXT,
    "niveau" TEXT,
    "uniteId" TEXT NOT NULL,

    CONSTRAINT "pcs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "instituts_uniteId_key" ON "instituts"("uniteId");

-- CreateIndex
CREATE UNIQUE INDEX "dcts_uniteId_key" ON "dcts"("uniteId");

-- CreateIndex
CREATE UNIQUE INDEX "pcs_uniteId_key" ON "pcs"("uniteId");

-- AddForeignKey
ALTER TABLE "instituts" ADD CONSTRAINT "instituts_uniteId_fkey" FOREIGN KEY ("uniteId") REFERENCES "unites"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dcts" ADD CONSTRAINT "dcts_uniteId_fkey" FOREIGN KEY ("uniteId") REFERENCES "unites"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pcs" ADD CONSTRAINT "pcs_uniteId_fkey" FOREIGN KEY ("uniteId") REFERENCES "unites"("id") ON DELETE CASCADE ON UPDATE CASCADE;
