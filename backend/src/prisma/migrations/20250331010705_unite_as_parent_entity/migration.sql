/*
  Warnings:

  - You are about to drop the column `institutId` on the `daily_situations` table. All the data in the column will be lost.
  - You are about to drop the column `institutId` on the `personnels` table. All the data in the column will be lost.
  - You are about to drop the column `institutId` on the `unites` table. All the data in the column will be lost.
  - You are about to drop the `instituts` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `uniteId` to the `daily_situations` table without a default value. This is not possible if the table is not empty.
  - Added the required column `uniteId` to the `personnels` table without a default value. This is not possible if the table is not empty.
  - Added the required column `type` to the `unites` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "UniteType" AS ENUM ('INSTITUT', 'DCT', 'PC');

-- DropForeignKey
ALTER TABLE "daily_situations" DROP CONSTRAINT "daily_situations_institutId_fkey";

-- DropForeignKey
ALTER TABLE "instituts" DROP CONSTRAINT "instituts_directeurId_fkey";

-- DropForeignKey
ALTER TABLE "personnels" DROP CONSTRAINT "personnels_institutId_fkey";

-- DropForeignKey
ALTER TABLE "unites" DROP CONSTRAINT "unites_institutId_fkey";

-- AlterTable
ALTER TABLE "daily_situations" DROP COLUMN "institutId",
ADD COLUMN     "uniteId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "personnels" DROP COLUMN "institutId",
ADD COLUMN     "uniteId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "unites" DROP COLUMN "institutId",
ADD COLUMN     "anneeEtude" INTEGER,
ADD COLUMN     "directeurId" INTEGER,
ADD COLUMN     "emplacement" TEXT,
ADD COLUMN     "parentId" TEXT,
ADD COLUMN     "type" "UniteType" NOT NULL;

-- DropTable
DROP TABLE "instituts";

-- AddForeignKey
ALTER TABLE "unites" ADD CONSTRAINT "unites_directeurId_fkey" FOREIGN KEY ("directeurId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "unites" ADD CONSTRAINT "unites_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "unites"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "personnels" ADD CONSTRAINT "personnels_uniteId_fkey" FOREIGN KEY ("uniteId") REFERENCES "unites"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "daily_situations" ADD CONSTRAINT "daily_situations_uniteId_fkey" FOREIGN KEY ("uniteId") REFERENCES "unites"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
