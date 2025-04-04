-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "GradeMilitaire" ADD VALUE 'MEDECIN_COMMANDANT';
ALTER TYPE "GradeMilitaire" ADD VALUE 'MEDECIN_LIEUTENANT_COLONEL';
ALTER TYPE "GradeMilitaire" ADD VALUE 'MEDECIN_COLONEL';
ALTER TYPE "GradeMilitaire" ADD VALUE 'MEDECIN_GENERAL';
ALTER TYPE "GradeMilitaire" ADD VALUE 'INTENDANT_COMMANDANT';
ALTER TYPE "GradeMilitaire" ADD VALUE 'INTENDANT_LIEUTENANT_COLONEL';
ALTER TYPE "GradeMilitaire" ADD VALUE 'INTENDANT_COLONEL';
ALTER TYPE "GradeMilitaire" ADD VALUE 'INTENDANT_GENERAL';
ALTER TYPE "GradeMilitaire" ADD VALUE 'COMMANDANT_INGENIEUR';
ALTER TYPE "GradeMilitaire" ADD VALUE 'LIEUTENANT_COLONEL_INGENIEUR';
ALTER TYPE "GradeMilitaire" ADD VALUE 'COLONEL_INGENIEUR';
ALTER TYPE "GradeMilitaire" ADD VALUE 'GENERAL_INGENIEUR';
ALTER TYPE "GradeMilitaire" ADD VALUE 'LIEUTENANT_INGENIEUR';
ALTER TYPE "GradeMilitaire" ADD VALUE 'CAPITAINE_INGENIEUR';
ALTER TYPE "GradeMilitaire" ADD VALUE 'INTENDANT_SOUS_LIEUTENANT';
ALTER TYPE "GradeMilitaire" ADD VALUE 'INTENDANT_LIEUTENANT';
ALTER TYPE "GradeMilitaire" ADD VALUE 'INTENDANT_CAPITAINE';
ALTER TYPE "GradeMilitaire" ADD VALUE 'MEDECIN_LIEUTENANT';
ALTER TYPE "GradeMilitaire" ADD VALUE 'MEDECIN_CAPITAINE';
