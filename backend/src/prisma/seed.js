// prisma/seed.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Create decoration types
  const decorations = [
    { titre: "Médaille de la Reconnaissance Nationale", description: "Attribuée pour service exceptionnel et dévouement exemplaire" },
    { titre: "Ordre du Merite National", description: "Attribuée pour actes de bravoure au combat ou en situation de danger" }
  ];

  console.log('Starting to seed decorations...');
  
  for (const decoration of decorations) {
    const exists = await prisma.decoration.findUnique({
      where: { titre: decoration.titre }
    });
    
    if (!exists) {
      await prisma.decoration.create({
        data: decoration
      });
      console.log(`Created decoration: ${decoration.titre}`);
    } else {
      console.log(`Decoration already exists: ${decoration.titre}`);
    }
  }
  
  const count = await prisma.decoration.count();
  console.log(`Database has ${count} decorations`);
  console.log('Seed completed successfully');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });