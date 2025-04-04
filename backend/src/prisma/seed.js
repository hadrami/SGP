// seed-unites.js - Create sample data for Unite with different types
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const dotenv = require('dotenv');
const path = require('path');

// Try multiple possible locations for the .env file
try {
  // First try the project root (assuming script is in src/prisma)
  const rootEnvPath = path.resolve(__dirname, '../../.env');
  console.log(`Trying to load .env from: ${rootEnvPath}`);
  const result = dotenv.config({ path: rootEnvPath });
  
  if (result.error) {
    // Then try the prisma directory
    console.log('Failed to load .env from project root, trying prisma directory');
    const prismaEnvPath = path.resolve(__dirname, './.env');
    dotenv.config({ path: prismaEnvPath });
  }
} catch (error) {
  console.error('Error loading .env file:', error);
}

const prisma = new PrismaClient();

async function seedUnites() {
  console.log('Starting to seed Unite data with different types...');

  // Create test user if not exist
  let adminUser = await prisma.user.findUnique({
    where: { identifier: 'admin' }
  });

  if (!adminUser) {
    adminUser = await prisma.user.create({
      data: {
        identifier: 'admin',
        name: 'Administrateur Système',
        password: await bcrypt.hash('admin123', 10),
        email: 'admin@defense.gov.mr',
        role: 'ADMIN',
        isFirstLogin: false,
        lastLogin: new Date(),
      }
    });
    console.log('Created admin user');
  }

  // Create sample Unites of type INSTITUT
  const institutData = [
    {
      unite: {
        nom: 'Institut Préparatoire aux Grandes Ecoles d\'Ingénieurs',
        code: 'IPGEI',
        description: 'Institut Préparatoire aux Grandes Ecoles d\'Ingénieurs',
        type: 'INSTITUT',
        directeurId: adminUser.id
      },
      details: {
        emplacement: 'Nouakchott',
        anneeEtude: 2,
        specialite: 'Sciences et Ingénierie'
      }
    },
    {
      unite: {
        nom: 'Institut Supérieur des Métiers de la Mine de Zouerate',
        code: 'IS2M',
        description: 'Institut Préparatoire aux Grandes Ecoles d\'Ingénieurs',
        type: 'INSTITUT',
        directeurId: adminUser.id
      },
      details: {
        emplacement: 'Zouerat',
        anneeEtude: 3,
        specialite: 'Ingénierie minière'
      }
    },
    {
      unite: {
        nom: 'Institut Supérieur des Métiers de l\'Energie',
        code: 'ISME',
        description: 'Institut Supérieur des Métiers de l\'Energie',
        type: 'INSTITUT',
        directeurId: adminUser.id
      },
      details: {
        emplacement: 'Nouakchott',
        anneeEtude: 3,
        specialite: 'Énergies et systèmes électriques'
      }
    },
    {
      unite: {
        nom: 'Institut Supérieur des Métiers de la Statistique',
        code: 'ISMS',
        description: 'Institut Supérieur des Métiers de la Statistique',
        type: 'INSTITUT',
        directeurId: adminUser.id
      },
      details: {
        emplacement: 'Nouakchott',
        anneeEtude: 3,
        specialite: 'Statistiques et analyse de données'
      }
    },
    {
      unite: {
        nom: 'Ecole Supérieure Polytechnique',
        code: 'ESP',
        description: 'Ecole Supérieure Polytechnique',
        type: 'INSTITUT',
        directeurId: adminUser.id
      },
      details: {
        emplacement: 'Nouakchott',
        anneeEtude: 3,
        specialite: 'Sciences et technologies'
      }
    },
    {
      unite: {
        nom: 'Institut Supérieur des Métiers du Bâtiment des Travaux Public et de l\'Urbanisme d\'Aleg',
        code: 'ISMBTPU',
        description: 'Institut Supérieur des Métiers du Bâtiment des Travaux Public et de l\'Urbanisme',
        type: 'INSTITUT',
        directeurId: adminUser.id
      },
      details: {
        emplacement: 'Aleg',
        anneeEtude: 3,
        specialite: 'Construction et urbanisme'
      }
    }
  ];

  // Create sample Unites of type DCT (Direction Centrale Transversale)
  const dctData = [
    {
      unite: {
        nom: 'Direction des Ressources Humaines',
        code: 'DRH',
        description: 'Direction responsable de la gestion du personnel',
        type: 'DCT',
        directeurId: adminUser.id
      },
      details: {
        domaine: 'Gestion des ressources humaines',
        niveau: 'Direction centrale'
      }
    },
    {
      unite: {
        nom: 'Direction de la Sécurité des Services Généraux et de la Logistique',
        code: 'DSSGL',
        description: 'Direction responsable de la logistique et des équipements',
        type: 'DCT',
        directeurId: adminUser.id
      },
      details: {
        domaine: 'Sécurité et logistique',
        niveau: 'Direction centrale'
      }
    },
    {
      unite: {
        nom: 'Direction des Laboratoires de la Documentation et de la Communication',
        code: 'DLDC',
        description: 'Direction responsable de la documentation et de la communication',
        type: 'DCT',
        directeurId: adminUser.id
      },
      details: {
        domaine: 'Documentation et communication',
        niveau: 'Direction centrale'
      }
    },
    {
      unite: {
        nom: 'Centre des Traitements Informatiques et Statistiques',
        code: 'CTIS',
        description: 'Centre des traitements informatiques et statistiques',
        type: 'DCT',
        directeurId: adminUser.id
      },
      details: {
        domaine: 'Informatique et statistiques',
        niveau: 'Centre spécialisé'
      }
    },
    {
      unite: {
        nom: 'Service d\'Administration et Finance',
        code: 'SAF',
        description: 'Service d\'administration et finance',
        type: 'DCT',
        directeurId: adminUser.id
      },
      details: {
        domaine: 'Administration et finances',
        niveau: 'Service central'
      }
    },
    {
      unite: {
        nom: 'Direction de l\'Enseignement Militaire',
        code: 'DEM',
        description: 'Direction de l\'enseignement militaire',
        type: 'DCT',
        directeurId: adminUser.id
      },
      details: {
        domaine: 'Enseignement militaire',
        niveau: 'Direction centrale'
      }
    },
    {
      unite: {
        nom: 'Centre Œuvres Universitaires',
        code: 'COU',
        description: 'Centre Œuvres Universitaires',
        type: 'DCT',
        directeurId: adminUser.id
      },
      details: {
        domaine: 'Services universitaires',
        niveau: 'Centre spécialisé'
      }
    }
  ];

  // Create sample Unites of type PC (Poste de Commandement)
  const pcData = [
    {
      unite: {
        nom: 'Poste de Commandement GP',
        code: 'PC',
        description: 'Poste de commandement du groupe polytechnique',
        type: 'PC',
        directeurId: adminUser.id
      },
      details: {
        typePC: 'Stratégique',
        zoneOperation: 'Nationale',
        niveau: 'Supérieur'
      }
    }
  ];

  // Create all unites with their specific type details
  console.log('Creating INSTITUT type unites...');
  await createUnitesWithDetails(institutData, 'INSTITUT');
  
  console.log('Creating DCT type unites...');
  await createUnitesWithDetails(dctData, 'DCT');
  
  console.log('Creating PC type unites...');
  const createdPCs = await createUnitesWithDetails(pcData, 'PC');

  // Add just one SousUnite for the PC
  if (createdPCs.length > 0) {
    const pcUnite = createdPCs[0];
    
    // Check if SousUnite already exists
    const existingSousUnite = await prisma.sousUnite.findUnique({
      where: { code: 'CELL-PC' }
    });

    if (!existingSousUnite) {
      // Create one SousUnite for the PC
      const sousUnite = await prisma.sousUnite.create({
        data: {
          nom: 'Cellule Opérationnelle',
          code: 'CELL-PC',
          description: 'Cellule opérationnelle du poste de commandement',
          uniteId: pcUnite.id
        }
      });
      console.log(`Created sous-unite: ${sousUnite.nom} for unite ${pcUnite.nom}`);
    } else {
      console.log(`SousUnite CELL-PC already exists, skipping...`);
    }
  }

  console.log('Seed completed successfully');
}

// Helper function to create unites with their type-specific details
async function createUnitesWithDetails(unitesData, type) {
  const createdUnites = [];

  for (const data of unitesData) {
    // Check if unite already exists
    const existingUnite = await prisma.unite.findUnique({
      where: { code: data.unite.code }
    });

    if (existingUnite) {
      console.log(`Unite ${data.unite.code} already exists, updating its details...`);
      
      // Update the existing unite with new details if needed
      let updatedUnit = existingUnite;
      
      // Update type-specific details
      if (type === 'INSTITUT') {
        await prisma.institut.upsert({
          where: { uniteId: existingUnite.id },
          update: data.details,
          create: {
            ...data.details,
            uniteId: existingUnite.id
          }
        });
      } else if (type === 'DCT') {
        await prisma.dCT.upsert({
          where: { uniteId: existingUnite.id },
          update: data.details,
          create: {
            ...data.details,
            uniteId: existingUnite.id
          }
        });
      } else if (type === 'PC') {
        await prisma.pC.upsert({
          where: { uniteId: existingUnite.id },
          update: data.details,
          create: {
            ...data.details,
            uniteId: existingUnite.id
          }
        });
      }
      
      createdUnites.push(updatedUnit);
      continue;
    }

    // Create new unite with its type-specific details
    let createdUnite;
    
    if (type === 'INSTITUT') {
      createdUnite = await prisma.unite.create({
        data: {
          ...data.unite,
          institut: {
            create: data.details
          }
        }
      });
    } else if (type === 'DCT') {
      createdUnite = await prisma.unite.create({
        data: {
          ...data.unite,
          dct: {
            create: data.details
          }
        }
      });
    } else if (type === 'PC') {
      createdUnite = await prisma.unite.create({
        data: {
          ...data.unite,
          pc: {
            create: data.details
          }
        }
      });
    }
    
    console.log(`Created unite: ${createdUnite.nom} (Type: ${createdUnite.type})`);
    createdUnites.push(createdUnite);
  }

  return createdUnites;
}

seedUnites()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });