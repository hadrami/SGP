/*
  Warnings:

  - You are about to drop the column `militaireId` on the `decorations` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[titre]` on the table `decorations` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "decorations" DROP CONSTRAINT "decorations_militaireId_fkey";

-- AlterTable
ALTER TABLE "decorations" DROP COLUMN "militaireId",
ALTER COLUMN "dateObtention" SET DEFAULT '2020-01-01 00:00:00 +00:00';

-- CreateTable
CREATE TABLE "militaire_decorations" (
    "id" TEXT NOT NULL,
    "description" TEXT,
    "dateObtention" TIMESTAMP(3) NOT NULL,
    "observations" TEXT,
    "militaireId" TEXT NOT NULL,
    "decorationId" TEXT NOT NULL,

    CONSTRAINT "militaire_decorations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "militaire_decorations_militaireId_decorationId_dateObtentio_key" ON "militaire_decorations"("militaireId", "decorationId", "dateObtention");

-- CreateIndex
CREATE UNIQUE INDEX "decorations_titre_key" ON "decorations"("titre");

-- AddForeignKey
ALTER TABLE "militaire_decorations" ADD CONSTRAINT "militaire_decorations_militaireId_fkey" FOREIGN KEY ("militaireId") REFERENCES "militaires"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "militaire_decorations" ADD CONSTRAINT "militaire_decorations_decorationId_fkey" FOREIGN KEY ("decorationId") REFERENCES "decorations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
