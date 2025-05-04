/*
  Warnings:

  - You are about to drop the column `institution` on the `personnel_diplomes` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[personnelId,diplomeId,dateObtention]` on the table `personnel_diplomes` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "personnel_diplomes_personnelId_diplomeId_institution_dateOb_key";

-- AlterTable
ALTER TABLE "personnel_diplomes" DROP COLUMN "institution";

-- CreateIndex
CREATE UNIQUE INDEX "personnel_diplomes_personnelId_diplomeId_dateObtention_key" ON "personnel_diplomes"("personnelId", "diplomeId", "dateObtention");
