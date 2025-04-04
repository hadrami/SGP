// migrate-institut-to-unite.js
const { PrismaClient } = require('@prisma/client');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const prisma = new PrismaClient();

async function migrateInstitutToUnite() {
  try {
    console.log('Starting migration of Institut to Unite using direct SQL...');

    // 1. Check if instituts table exists in the database
    try {
      // Try to query instituts table using raw SQL
      const institutCount = await prisma.$queryRaw`SELECT COUNT(*) FROM "instituts"`;
      console.log(`Found instituts table with ${institutCount[0].count} records`);
    } catch (error) {
      console.log('Instituts table not found or already migrated. Skipping migration.');
      return;
    }

    // 2. Get all existing Instituts using raw SQL
    const instituts = await prisma.$queryRaw`SELECT * FROM "instituts"`;
    console.log(`Found ${instituts.length} instituts to migrate`);

    // 3. For each institut, create a new unite
    for (const institut of instituts) {
      console.log(`Migrating institut: ${institut.nom}`);

      // Create the Unite record with the Institut data
      const [newUnite] = await prisma.$queryRaw`
        INSERT INTO "unites" ("id", "nom", "code", "description", "type", "emplacement", "anneeEtude", "directeurId")
        VALUES (
          ${institut.id}, 
          ${institut.nom}, 
          ${institut.code}, 
          ${institut.description}, 
          'INSTITUT', 
          ${institut.emplacement}, 
          ${institut.anneeEtude}, 
          ${institut.directeurId}
        )
        RETURNING *
      `;

      console.log(`Created Unite (type INSTITUT) with ID: ${newUnite.id}`);

      // 4. Update personnel references
      const personnelResult = await prisma.$executeRaw`
        UPDATE "personnels" 
        SET "uniteId" = ${institut.id} 
        WHERE "institutId" = ${institut.id}
      `;
      console.log(`Updated ${personnelResult} personnel records`);

      // 5. Update daily_situations references
      const situationResult = await prisma.$executeRaw`
        UPDATE "daily_situations" 
        SET "uniteId" = ${institut.id} 
        WHERE "institutId" = ${institut.id}
      `;
      console.log(`Updated ${situationResult} daily situation records`);

      console.log(`Successfully migrated institut: ${institut.nom}`);
    }

    console.log('Migration completed successfully.');
    
  } catch (error) {
    console.error('Error during migration:', error);
    throw error;
  }
}

// Run the migration
migrateInstitutToUnite()
  .then(() => console.log('Migration script executed successfully.'))
  .catch(error => console.error('Migration failed:', error))
  .finally(() => prisma.$disconnect());