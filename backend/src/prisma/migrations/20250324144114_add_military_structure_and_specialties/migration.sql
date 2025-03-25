/*
  Warnings:

  - You are about to drop the column `division` on the `militaires` table. All the data in the column will be lost.
  - You are about to drop the column `positionId` on the `militaires` table. All the data in the column will be lost.
  - You are about to drop the `positions` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "TypeDiplome" AS ENUM ('MILITAIRE', 'ACADEMIQUE');

-- CreateEnum
CREATE TYPE "TypeNotation" AS ENUM ('ANNUELLE', 'EXCEPTIONNELLE', 'STAGE', 'MISSION');

-- CreateEnum
CREATE TYPE "StatutStage" AS ENUM ('EN_COURS', 'EFFECTUE', 'ANNULE', 'PLANIFIE');

-- CreateEnum
CREATE TYPE "CategorieOfficier" AS ENUM ('OFFICIER_SUPERIEUR', 'OFFICIER_SUBALTERNE');

-- CreateEnum
CREATE TYPE "CategorieSousOfficier" AS ENUM ('SOUS_OFFICIER_SUPERIEUR', 'SOUS_OFFICIER_SUBALTERNE');

-- CreateEnum
CREATE TYPE "SituationMilitaire" AS ENUM ('PRESENT', 'ABSENT', 'MISSION', 'CONGE', 'HOSPITALISATION', 'FORMATION', 'DETACHEMENT', 'RETRAITE', 'DISPONIBILITE', 'DESERTEUR', 'AUTRE');

-- DropForeignKey
ALTER TABLE "militaires" DROP CONSTRAINT "militaires_positionId_fkey";

-- AlterTable
ALTER TABLE "militaires" DROP COLUMN "division",
DROP COLUMN "positionId",
ADD COLUMN     "armeId" TEXT,
ADD COLUMN     "categorieOfficier" "CategorieOfficier",
ADD COLUMN     "categorieSousOfficier" "CategorieSousOfficier",
ADD COLUMN     "fonctionId" TEXT,
ADD COLUMN     "situation" "SituationMilitaire" NOT NULL DEFAULT 'PRESENT',
ADD COLUMN     "situationDepuis" TIMESTAMP(3),
ADD COLUMN     "situationDetail" TEXT,
ADD COLUMN     "situationJusqua" TIMESTAMP(3),
ADD COLUMN     "sousUniteId" TEXT,
ADD COLUMN     "specialiteId" TEXT;

-- DropTable
DROP TABLE "positions";

-- CreateTable
CREATE TABLE "unites" (
    "id" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "description" TEXT,
    "institutId" TEXT,

    CONSTRAINT "unites_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sous_unites" (
    "id" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "description" TEXT,
    "uniteId" TEXT NOT NULL,

    CONSTRAINT "sous_unites_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "armes" (
    "id" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "armes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "specialites" (
    "id" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "description" TEXT,
    "armeId" TEXT NOT NULL,

    CONSTRAINT "specialites_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "diplomes" (
    "id" TEXT NOT NULL,
    "titre" TEXT NOT NULL,
    "typeDiplome" "TypeDiplome" NOT NULL,
    "institution" TEXT NOT NULL,
    "dateObtention" TIMESTAMP(3) NOT NULL,
    "description" TEXT,
    "personnelId" TEXT NOT NULL,

    CONSTRAINT "diplomes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "decorations" (
    "id" TEXT NOT NULL,
    "titre" TEXT NOT NULL,
    "description" TEXT,
    "dateObtention" TIMESTAMP(3) NOT NULL,
    "militaireId" TEXT NOT NULL,

    CONSTRAINT "decorations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notations" (
    "id" TEXT NOT NULL,
    "typeNotation" "TypeNotation" NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "note" DOUBLE PRECISION NOT NULL,
    "observations" TEXT,
    "notateur" TEXT NOT NULL,
    "militaireId" TEXT NOT NULL,

    CONSTRAINT "notations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stages_militaires" (
    "id" TEXT NOT NULL,
    "titre" TEXT NOT NULL,
    "description" TEXT,
    "lieu" TEXT NOT NULL,
    "dateDebut" TIMESTAMP(3) NOT NULL,
    "dateFin" TIMESTAMP(3),
    "statut" "StatutStage" NOT NULL DEFAULT 'EN_COURS',
    "certificat" TEXT,
    "observations" TEXT,
    "militaireId" TEXT NOT NULL,

    CONSTRAINT "stages_militaires_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "situations_historique" (
    "id" TEXT NOT NULL,
    "situation" "SituationMilitaire" NOT NULL,
    "detail" TEXT,
    "dateDebut" TIMESTAMP(3) NOT NULL,
    "dateFin" TIMESTAMP(3) NOT NULL,
    "observations" TEXT,
    "militaireId" TEXT NOT NULL,

    CONSTRAINT "situations_historique_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fonctions" (
    "id" TEXT NOT NULL,
    "titre" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "fonctions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "unites_code_key" ON "unites"("code");

-- CreateIndex
CREATE UNIQUE INDEX "sous_unites_code_key" ON "sous_unites"("code");

-- CreateIndex
CREATE UNIQUE INDEX "armes_nom_key" ON "armes"("nom");

-- AddForeignKey
ALTER TABLE "unites" ADD CONSTRAINT "unites_institutId_fkey" FOREIGN KEY ("institutId") REFERENCES "instituts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sous_unites" ADD CONSTRAINT "sous_unites_uniteId_fkey" FOREIGN KEY ("uniteId") REFERENCES "unites"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "specialites" ADD CONSTRAINT "specialites_armeId_fkey" FOREIGN KEY ("armeId") REFERENCES "armes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "diplomes" ADD CONSTRAINT "diplomes_personnelId_fkey" FOREIGN KEY ("personnelId") REFERENCES "personnels"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "decorations" ADD CONSTRAINT "decorations_militaireId_fkey" FOREIGN KEY ("militaireId") REFERENCES "militaires"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notations" ADD CONSTRAINT "notations_militaireId_fkey" FOREIGN KEY ("militaireId") REFERENCES "militaires"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stages_militaires" ADD CONSTRAINT "stages_militaires_militaireId_fkey" FOREIGN KEY ("militaireId") REFERENCES "militaires"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "militaires" ADD CONSTRAINT "militaires_fonctionId_fkey" FOREIGN KEY ("fonctionId") REFERENCES "fonctions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "militaires" ADD CONSTRAINT "militaires_sousUniteId_fkey" FOREIGN KEY ("sousUniteId") REFERENCES "sous_unites"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "militaires" ADD CONSTRAINT "militaires_armeId_fkey" FOREIGN KEY ("armeId") REFERENCES "armes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "militaires" ADD CONSTRAINT "militaires_specialiteId_fkey" FOREIGN KEY ("specialiteId") REFERENCES "specialites"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "situations_historique" ADD CONSTRAINT "situations_historique_militaireId_fkey" FOREIGN KEY ("militaireId") REFERENCES "militaires"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
