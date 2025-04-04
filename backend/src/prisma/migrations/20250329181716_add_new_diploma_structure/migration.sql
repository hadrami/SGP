-- CreateTable
CREATE TABLE "diplomes_new" (
    "id" TEXT NOT NULL,
    "titre" TEXT NOT NULL,
    "typeDiplome" "TypeDiplome" NOT NULL,
    "description" TEXT,

    CONSTRAINT "diplomes_new_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "personnel_diplomes" (
    "id" TEXT NOT NULL,
    "institution" TEXT NOT NULL,
    "dateObtention" TIMESTAMP(3) NOT NULL,
    "observations" TEXT,
    "personnelId" TEXT NOT NULL,
    "diplomeId" TEXT NOT NULL,

    CONSTRAINT "personnel_diplomes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "diplomes_new_titre_key" ON "diplomes_new"("titre");

-- CreateIndex
CREATE UNIQUE INDEX "personnel_diplomes_personnelId_diplomeId_institution_dateOb_key" ON "personnel_diplomes"("personnelId", "diplomeId", "institution", "dateObtention");

-- AddForeignKey
ALTER TABLE "personnel_diplomes" ADD CONSTRAINT "personnel_diplomes_personnelId_fkey" FOREIGN KEY ("personnelId") REFERENCES "personnels"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "personnel_diplomes" ADD CONSTRAINT "personnel_diplomes_diplomeId_fkey" FOREIGN KEY ("diplomeId") REFERENCES "diplomes_new"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
