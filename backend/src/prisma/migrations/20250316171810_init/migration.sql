/*
  Warnings:

  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "TypePersonnel" AS ENUM ('MILITAIRE', 'CIVIL_PROFESSEUR', 'CIVIL_ETUDIANT', 'CIVIL_EMPLOYE');

-- CreateEnum
CREATE TYPE "CategorieMilitaire" AS ENUM ('OFFICIER', 'SOUS_OFFICIER', 'SOLDAT');

-- CreateEnum
CREATE TYPE "GradeMilitaire" AS ENUM ('SOUS_LIEUTENANT', 'LIEUTENANT', 'CAPITAINE', 'COMMANDANT', 'LIEUTENANT_COLONEL', 'COLONEL', 'GENERAL', 'SERGENT', 'SERGENT_CHEF', 'ADJUDANT', 'ADJUDANT_CHEF', 'SOLDAT_DEUXIEME_CLASSE', 'SOLDAT_PREMIERE_CLASSE', 'CAPORAL');

-- CreateEnum
CREATE TYPE "GroupeSanguin" AS ENUM ('A_POSITIF', 'A_NEGATIF', 'B_POSITIF', 'B_NEGATIF', 'AB_POSITIF', 'AB_NEGATIF', 'O_POSITIF', 'O_NEGATIF');

-- CreateEnum
CREATE TYPE "TypeContrat" AS ENUM ('PERMANENT', 'CDI', 'CDD', 'VACATAIRE', 'PSV');

-- CreateEnum
CREATE TYPE "TypeCours" AS ENUM ('COURS', 'TP', 'TD');

-- CreateEnum
CREATE TYPE "StatutEtudiant" AS ENUM ('PRESENT', 'ABSENT', 'CONSULTATION_MEDICALE', 'SANCTION', 'STAGE');

-- CreateEnum
CREATE TYPE "TypeDocument" AS ENUM ('IDENTITE', 'DIPLOME', 'CONTRAT', 'MEDICAL', 'ADMINISTRATIF', 'AUTRE');

-- DropTable
DROP TABLE "User";

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "identifier" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "email" TEXT,
    "role" TEXT NOT NULL DEFAULT 'USER',
    "langPreference" TEXT DEFAULT 'fr',
    "isFirstLogin" BOOLEAN NOT NULL DEFAULT true,
    "lastLogin" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "instituts" (
    "id" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "emplacement" TEXT NOT NULL,
    "description" TEXT,
    "anneeEtude" INTEGER,
    "directeurId" INTEGER,

    CONSTRAINT "instituts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "personnels" (
    "id" TEXT NOT NULL,
    "typePersonnel" "TypePersonnel" NOT NULL,
    "nom" TEXT NOT NULL,
    "prenom" TEXT NOT NULL,
    "dateNaissance" TIMESTAMP(3),
    "lieuNaissance" TEXT,
    "telephone" TEXT,
    "email" TEXT,
    "nni" TEXT NOT NULL,
    "institutId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "personnels_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "militaires" (
    "id" TEXT NOT NULL,
    "matricule" TEXT NOT NULL,
    "grade" "GradeMilitaire" NOT NULL,
    "categorie" "CategorieMilitaire" NOT NULL,
    "groupeSanguin" "GroupeSanguin",
    "dateRecrutement" TIMESTAMP(3),
    "telephoneService" TEXT,
    "dateDernierePromotion" TIMESTAMP(3),
    "division" TEXT,
    "personnelId" TEXT NOT NULL,
    "positionId" TEXT,

    CONSTRAINT "militaires_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "professeurs" (
    "id" TEXT NOT NULL,
    "specialite" TEXT NOT NULL,
    "diplome" TEXT NOT NULL,
    "position" TEXT,
    "typeContrat" "TypeContrat" NOT NULL,
    "personnelId" TEXT NOT NULL,

    CONSTRAINT "professeurs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "matieres" (
    "id" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "code" TEXT,
    "professeurId" TEXT NOT NULL,

    CONSTRAINT "matieres_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "classes" (
    "id" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "niveau" TEXT NOT NULL,
    "anneeScolaire" TEXT NOT NULL,

    CONSTRAINT "classes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cours_classes" (
    "id" TEXT NOT NULL,
    "typeCours" "TypeCours" NOT NULL,
    "nbHeures" INTEGER NOT NULL,
    "matiereId" TEXT NOT NULL,
    "classeId" TEXT NOT NULL,

    CONSTRAINT "cours_classes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "etudiants" (
    "id" TEXT NOT NULL,
    "matricule" TEXT NOT NULL,
    "diplome" TEXT,
    "anneeEtude" INTEGER NOT NULL,
    "statut" "StatutEtudiant" NOT NULL DEFAULT 'PRESENT',
    "personnelId" TEXT NOT NULL,

    CONSTRAINT "etudiants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "releves_notes" (
    "id" TEXT NOT NULL,
    "semestre" TEXT NOT NULL,
    "anneeScolaire" TEXT NOT NULL,
    "dateEmission" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "etudiantId" TEXT NOT NULL,

    CONSTRAINT "releves_notes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notes" (
    "id" TEXT NOT NULL,
    "matiere" TEXT NOT NULL,
    "note" DOUBLE PRECISION NOT NULL,
    "coefficient" DOUBLE PRECISION NOT NULL,
    "releveNoteId" TEXT NOT NULL,

    CONSTRAINT "notes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stages" (
    "id" TEXT NOT NULL,
    "titre" TEXT NOT NULL,
    "description" TEXT,
    "entreprise" TEXT NOT NULL,
    "dateDebut" TIMESTAMP(3) NOT NULL,
    "dateFin" TIMESTAMP(3) NOT NULL,
    "evaluation" TEXT,
    "etudiantId" TEXT NOT NULL,

    CONSTRAINT "stages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "employes" (
    "id" TEXT NOT NULL,
    "position" TEXT NOT NULL,
    "typeContrat" "TypeContrat" NOT NULL,
    "diplome" TEXT,
    "situation" TEXT DEFAULT 'PRESENT',
    "personnelId" TEXT NOT NULL,

    CONSTRAINT "employes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "positions" (
    "id" TEXT NOT NULL,
    "titre" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "positions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "documents" (
    "id" TEXT NOT NULL,
    "typeDocument" "TypeDocument" NOT NULL,
    "nomFichier" TEXT NOT NULL,
    "cheminFichier" TEXT NOT NULL,
    "description" TEXT,
    "dateUpload" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "personnelId" TEXT NOT NULL,
    "uploadePar" INTEGER NOT NULL,

    CONSTRAINT "documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "daily_situations" (
    "id" TEXT NOT NULL,
    "dateRapport" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "militairesPresents" INTEGER NOT NULL,
    "civilsPresents" INTEGER NOT NULL,
    "professeursPresents" INTEGER NOT NULL,
    "etudiantsPresents" INTEGER NOT NULL,
    "remarques" TEXT,
    "institutId" TEXT NOT NULL,
    "creePar" INTEGER NOT NULL,

    CONSTRAINT "daily_situations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_ProfesseurClasses" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_ProfesseurClasses_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_EtudiantClasses" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_EtudiantClasses_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_identifier_key" ON "users"("identifier");

-- CreateIndex
CREATE UNIQUE INDEX "instituts_code_key" ON "instituts"("code");

-- CreateIndex
CREATE UNIQUE INDEX "personnels_nni_key" ON "personnels"("nni");

-- CreateIndex
CREATE UNIQUE INDEX "militaires_matricule_key" ON "militaires"("matricule");

-- CreateIndex
CREATE UNIQUE INDEX "militaires_personnelId_key" ON "militaires"("personnelId");

-- CreateIndex
CREATE UNIQUE INDEX "professeurs_personnelId_key" ON "professeurs"("personnelId");

-- CreateIndex
CREATE UNIQUE INDEX "etudiants_matricule_key" ON "etudiants"("matricule");

-- CreateIndex
CREATE UNIQUE INDEX "etudiants_personnelId_key" ON "etudiants"("personnelId");

-- CreateIndex
CREATE UNIQUE INDEX "employes_personnelId_key" ON "employes"("personnelId");

-- CreateIndex
CREATE INDEX "_ProfesseurClasses_B_index" ON "_ProfesseurClasses"("B");

-- CreateIndex
CREATE INDEX "_EtudiantClasses_B_index" ON "_EtudiantClasses"("B");

-- AddForeignKey
ALTER TABLE "instituts" ADD CONSTRAINT "instituts_directeurId_fkey" FOREIGN KEY ("directeurId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "personnels" ADD CONSTRAINT "personnels_institutId_fkey" FOREIGN KEY ("institutId") REFERENCES "instituts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "militaires" ADD CONSTRAINT "militaires_personnelId_fkey" FOREIGN KEY ("personnelId") REFERENCES "personnels"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "militaires" ADD CONSTRAINT "militaires_positionId_fkey" FOREIGN KEY ("positionId") REFERENCES "positions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "professeurs" ADD CONSTRAINT "professeurs_personnelId_fkey" FOREIGN KEY ("personnelId") REFERENCES "personnels"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "matieres" ADD CONSTRAINT "matieres_professeurId_fkey" FOREIGN KEY ("professeurId") REFERENCES "professeurs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cours_classes" ADD CONSTRAINT "cours_classes_matiereId_fkey" FOREIGN KEY ("matiereId") REFERENCES "matieres"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cours_classes" ADD CONSTRAINT "cours_classes_classeId_fkey" FOREIGN KEY ("classeId") REFERENCES "classes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "etudiants" ADD CONSTRAINT "etudiants_personnelId_fkey" FOREIGN KEY ("personnelId") REFERENCES "personnels"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "releves_notes" ADD CONSTRAINT "releves_notes_etudiantId_fkey" FOREIGN KEY ("etudiantId") REFERENCES "etudiants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notes" ADD CONSTRAINT "notes_releveNoteId_fkey" FOREIGN KEY ("releveNoteId") REFERENCES "releves_notes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stages" ADD CONSTRAINT "stages_etudiantId_fkey" FOREIGN KEY ("etudiantId") REFERENCES "etudiants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employes" ADD CONSTRAINT "employes_personnelId_fkey" FOREIGN KEY ("personnelId") REFERENCES "personnels"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_personnelId_fkey" FOREIGN KEY ("personnelId") REFERENCES "personnels"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_uploadePar_fkey" FOREIGN KEY ("uploadePar") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "daily_situations" ADD CONSTRAINT "daily_situations_institutId_fkey" FOREIGN KEY ("institutId") REFERENCES "instituts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "daily_situations" ADD CONSTRAINT "daily_situations_creePar_fkey" FOREIGN KEY ("creePar") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ProfesseurClasses" ADD CONSTRAINT "_ProfesseurClasses_A_fkey" FOREIGN KEY ("A") REFERENCES "classes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ProfesseurClasses" ADD CONSTRAINT "_ProfesseurClasses_B_fkey" FOREIGN KEY ("B") REFERENCES "professeurs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_EtudiantClasses" ADD CONSTRAINT "_EtudiantClasses_A_fkey" FOREIGN KEY ("A") REFERENCES "classes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_EtudiantClasses" ADD CONSTRAINT "_EtudiantClasses_B_fkey" FOREIGN KEY ("B") REFERENCES "etudiants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
