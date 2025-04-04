/*
  Warnings:

  - You are about to drop the column `diplome` on the `employes` table. All the data in the column will be lost.
  - You are about to drop the column `diplome` on the `etudiants` table. All the data in the column will be lost.
  - You are about to drop the column `diplome` on the `professeurs` table. All the data in the column will be lost.
  - You are about to drop the `diplomes` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "diplomes" DROP CONSTRAINT "diplomes_personnelId_fkey";

-- AlterTable
ALTER TABLE "employes" DROP COLUMN "diplome";

-- AlterTable
ALTER TABLE "etudiants" DROP COLUMN "diplome";

-- AlterTable
ALTER TABLE "professeurs" DROP COLUMN "diplome";

-- DropTable
DROP TABLE "diplomes";
