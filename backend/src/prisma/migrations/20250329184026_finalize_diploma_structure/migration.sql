/*
  Warnings:

  - You are about to drop the `diplomes_new` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "personnel_diplomes" DROP CONSTRAINT "personnel_diplomes_diplomeId_fkey";

-- DropTable
DROP TABLE "diplomes_new";

-- CreateTable
CREATE TABLE "diplomes" (
    "id" TEXT NOT NULL,
    "titre" TEXT NOT NULL,
    "typeDiplome" "TypeDiplome" NOT NULL,
    "description" TEXT,

    CONSTRAINT "diplomes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "diplomes_titre_key" ON "diplomes"("titre");

-- AddForeignKey
ALTER TABLE "personnel_diplomes" ADD CONSTRAINT "personnel_diplomes_diplomeId_fkey" FOREIGN KEY ("diplomeId") REFERENCES "diplomes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
