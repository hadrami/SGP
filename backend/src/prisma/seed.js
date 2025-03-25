

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();

async function main() {
  console.log('Starting seeding process...');

  // Clean up existing data if needed
  await cleanupDatabase();

  // Create users
  const users = await createUsers();
  
  // Create instituts
  const instituts = await createInstituts(users);
  
  // Create unites and sous-unites
  const { unites, sousUnites } = await createUnites(instituts);
  
  // Create armes and specialites
  const { armes, specialites } = await createArmes();
  
  // Create fonctions
  const fonctions = await createFonctions();
  
  // Create personnel (including militaires, professeurs, etudiants, employes)
  const { personnels, militaires, professeurs, etudiants, employes } = 
    await createPersonnel(instituts, sousUnites, armes, specialites, fonctions);

  // Create stage militaires, decorations, notations, etc.
  await createMilitaireAssets(militaires);
  
  // Create academic classes, cours, matieres
  await createAcademicAssets(professeurs, etudiants);
  
  // Create documents
  await createDocuments(personnels, users);
  
  // Create daily situations
  await createDailySituations(instituts, users);

  console.log('Seeding completed successfully');
}

async function cleanupDatabase() {
  console.log('Cleaning up existing data...');
  
  // Delete all records in reverse order of dependencies
  const tables = [
    'daily_situations', 'documents', 'notes', 'releves_notes', 'stages', 
    'cours_classes', 'classes', 'matieres',
    'situations_historique', 'stages_militaires', 'notations', 'decorations',
    'militaires', 'professeurs', 'etudiants', 'employes', 'diplomes', 'personnels',
    'fonctions', 'specialites', 'armes', 'sous_unites', 'unites', 'instituts', 'users'
  ];
  
  for (const table of tables) {
    try {
      console.log(`Clearing table: ${table}`);
      await prisma.$executeRawUnsafe(`DELETE FROM "${table}"`);
    } catch (error) {
      console.log(`Error clearing table ${table}: ${error.message}`);
    }
  }
}

async function createUsers() {
  console.log('Creating users...');
  
  const users = [
    {
      identifier: 'admin',
      name: 'Administrateur Système',
      password: await bcrypt.hash('admin123', 10),
      email: 'admin@defense.gov.mr',
      role: 'ADMIN',
      isFirstLogin: false,
      lastLogin: new Date(),
    },
    {
      identifier: 'directeur1',
      name: 'Colonel Ahmed Mohamed',
      password: await bcrypt.hash('password123', 10),
      email: 'ahmed.mohamed@defense.gov.mr',
      role: 'DIRECTEUR',
      isFirstLogin: true,
    },
    {
      identifier: 'directeur2',
      name: 'Colonel Moussa Diallo',
      password: await bcrypt.hash('password123', 10),
      email: 'moussa.diallo@defense.gov.mr',
      role: 'DIRECTEUR',
      isFirstLogin: true,
    },
    {
      identifier: 'user1',
      name: 'Lieutenant Fatima Sy',
      password: await bcrypt.hash('password123', 10),
      email: 'fatima.sy@defense.gov.mr',
      role: 'USER',
      isFirstLogin: true,
    },
    {
      identifier: 'user2',
      name: 'Capitaine Ibrahim Diop',
      password: await bcrypt.hash('password123', 10),
      email: 'ibrahim.diop@defense.gov.mr',
      role: 'USER',
      isFirstLogin: true,
    }
  ];
  
  const createdUsers = [];
  
  for (const userData of users) {
    const user = await prisma.user.create({
      data: userData
    });
    console.log(`Created user: ${user.name}`);
    createdUsers.push(user);
  }
  
  return createdUsers;
}

async function createInstituts(users) {
  console.log('Creating instituts...');
  
  const instituts = [
    {
      nom: 'École d\'État-Major',
      code: 'EEM',
      emplacement: 'Nouakchott',
      description: 'École de formation supérieure pour les officiers',
      anneeEtude: 2,
      directeurId: users[1].id // directeur1
    },
    {
      nom: 'École Militaire Interarmes',
      code: 'EMIA',
      emplacement: 'Atar',
      description: 'École de formation des officiers',
      anneeEtude: 3,
      directeurId: users[2].id // directeur2
    },
    {
      nom: 'Centre d\'Instruction Naval',
      code: 'CIN',
      emplacement: 'Nouadhibou',
      description: 'Centre de formation pour la marine nationale',
      anneeEtude: 2,
      directeurId: null
    }
  ];
  
  const createdInstituts = [];
  
  for (const institutData of instituts) {
    const institut = await prisma.institut.create({
      data: institutData
    });
    console.log(`Created institut: ${institut.nom}`);
    createdInstituts.push(institut);
  }
  
  return createdInstituts;
}

async function createUnites(instituts) {
  console.log('Creating unites and sous-unites...');
  
  const unitesData = [
    {
      nom: 'Direction des Études',
      code: 'DE-EEM',
      description: 'Direction responsable des études et de la formation',
      institutId: instituts[0].id, // EEM
      sousUnites: [
        {
          nom: 'Division Pédagogique',
          code: 'DP-EEM',
          description: 'Division responsable de la pédagogie'
        },
        {
          nom: 'Division Recherche',
          code: 'DR-EEM',
          description: 'Division responsable de la recherche'
        }
      ]
    },
    {
      nom: 'Direction Administrative',
      code: 'DA-EEM',
      description: 'Direction responsable de l\'administration',
      institutId: instituts[0].id, // EEM
      sousUnites: [
        {
          nom: 'Division Personnel',
          code: 'DP-DA-EEM',
          description: 'Division responsable du personnel'
        },
        {
          nom: 'Division Logistique',
          code: 'DL-DA-EEM',
          description: 'Division responsable de la logistique'
        }
      ]
    },
    {
      nom: 'Direction des Études',
      code: 'DE-EMIA',
      description: 'Direction responsable des études et de la formation',
      institutId: instituts[1].id, // EMIA
      sousUnites: [
        {
          nom: 'Division Pédagogique',
          code: 'DP-EMIA',
          description: 'Division responsable de la pédagogie'
        },
        {
          nom: 'Division Stages',
          code: 'DS-EMIA',
          description: 'Division responsable des stages'
        }
      ]
    },
    {
      nom: 'Commandement',
      code: 'CMD-CIN',
      description: 'Commandement du centre',
      institutId: instituts[2].id, // CIN
      sousUnites: [
        {
          nom: 'Section Navigation',
          code: 'SN-CIN',
          description: 'Section responsable de la formation en navigation'
        },
        {
          nom: 'Section Technique',
          code: 'ST-CIN',
          description: 'Section responsable de la formation technique'
        }
      ]
    }
  ];
  
  const unites = [];
  const sousUnites = [];
  
  for (const uniteData of unitesData) {
    const { sousUnites: sousUnitesData, ...uniteInfo } = uniteData;
    
    const unite = await prisma.unite.create({
      data: uniteInfo
    });
    console.log(`Created unite: ${unite.nom}`);
    unites.push(unite);
    
    for (const sousUniteData of sousUnitesData) {
      const sousUnite = await prisma.sousUnite.create({
        data: {
          ...sousUniteData,
          uniteId: unite.id
        }
      });
      console.log(`Created sous-unite: ${sousUnite.nom}`);
      sousUnites.push(sousUnite);
    }
  }
  
  return { unites, sousUnites };
}

async function createArmes() {
  console.log('Creating armes and specialites...');
  
  const armesData = [
    {
      nom: 'Infanterie',
      description: 'Force combattante principale de l\'armée de terre',
      specialites: [
        {
          nom: 'Infanterie légère',
          description: 'Spécialité d\'infanterie mobile et rapide'
        },
        {
          nom: 'Infanterie mécanisée',
          description: 'Spécialité d\'infanterie appuyée par des véhicules blindés'
        }
      ]
    },
    {
      nom: 'Artillerie',
      description: 'Force de soutien de feu de l\'armée de terre',
      specialites: [
        {
          nom: 'Artillerie de campagne',
          description: 'Spécialité d\'artillerie mobile'
        },
        {
          nom: 'Artillerie anti-aérienne',
          description: 'Spécialité de défense contre les menaces aériennes'
        }
      ]
    },
    {
      nom: 'Marine',
      description: 'Force navale',
      specialites: [
        {
          nom: 'Navigation',
          description: 'Spécialité de navigation maritime'
        },
        {
          nom: 'Mécanique navale',
          description: 'Spécialité de maintenance des navires'
        }
      ]
    },
    {
      nom: 'Aviation',
      description: 'Force aérienne',
      specialites: [
        {
          nom: 'Pilotage',
          description: 'Spécialité de pilotage d\'aéronefs'
        },
        {
          nom: 'Maintenance aéronautique',
          description: 'Spécialité de maintenance des aéronefs'
        }
      ]
    },
    {
      nom: 'Génie',
      description: 'Force de construction et de démolition',
      specialites: [
        {
          nom: 'Génie de combat',
          description: 'Spécialité de génie militaire de combat'
        },
        {
          nom: 'Génie de construction',
          description: 'Spécialité de construction d\'infrastructures'
        }
      ]
    }
  ];
  
  const armes = [];
  const specialites = [];
  
  for (const armeData of armesData) {
    const { specialites: specialitesData, ...armeInfo } = armeData;
    
    const arme = await prisma.arme.create({
      data: armeInfo
    });
    console.log(`Created arme: ${arme.nom}`);
    armes.push(arme);
    
    for (const specialiteData of specialitesData) {
      const specialite = await prisma.specialite.create({
        data: {
          ...specialiteData,
          armeId: arme.id
        }
      });
      console.log(`Created specialite: ${specialite.nom}`);
      specialites.push(specialite);
    }
  }
  
  return { armes, specialites };
}

async function createFonctions() {
  console.log('Creating fonctions...');
  
  const fonctionsData = [
    {
      titre: 'Commandant',
      description: 'Chef d\'unité'
    },
    {
      titre: 'Chef de section',
      description: 'Responsable d\'une section'
    },
    {
      titre: 'Instructeur',
      description: 'Chargé de la formation'
    },
    {
      titre: 'Adjoint',
      description: 'Assistant du commandant'
    },
    {
      titre: 'Opérateur',
      description: 'Chargé des opérations spécifiques'
    }
  ];
  
  const fonctions = [];
  
  for (const fonctionData of fonctionsData) {
    const fonction = await prisma.fonction.create({
      data: fonctionData
    });
    console.log(`Created fonction: ${fonction.titre}`);
    fonctions.push(fonction);
  }
  
  return fonctions;
}

async function createPersonnel(instituts, sousUnites, armes, specialites, fonctions) {
  console.log('Creating personnel...');
  
  // Helper arrays
  const militaires = [];
  const professeurs = [];
  const etudiants = [];
  const employes = [];
  const personnels = [];
  
  // Create militaires
  const militairesData = [
    {
      personnel: {
        typePersonnel: 'MILITAIRE',
        nom: 'Diallo',
        prenom: 'Mohamed',
        dateNaissance: new Date('1975-05-15'),
        lieuNaissance: 'Nouakchott',
        telephone: '+22245678901',
        email: 'mohamed.diallo@defense.gov.mr',
        nni: 'MR12345678901',
        institutId: instituts[0].id, // EEM
      },
      militaire: {
        matricule: 'MIL001',
        grade: 'COLONEL',
        categorie: 'OFFICIER',
        categorieOfficier: 'OFFICIER_SUPERIEUR',
        groupeSanguin: 'O_POSITIF',
        dateRecrutement: new Date('1995-07-01'),
        telephoneService: '+22245678901',
        dateDernierePromotion: new Date('2018-01-15'),
        situation: 'PRESENT',
        situationDepuis: new Date('2022-01-01'),
        fonctionId: fonctions[0].id, // Commandant
        sousUniteId: sousUnites[0].id, // Division Pédagogique EEM
        armeId: armes[0].id, // Infanterie
        specialiteId: specialites[0].id, // Infanterie légère
      }
    },
    {
      personnel: {
        typePersonnel: 'MILITAIRE',
        nom: 'Sow',
        prenom: 'Fatima',
        dateNaissance: new Date('1985-11-23'),
        lieuNaissance: 'Nouadhibou',
        telephone: '+22245678902',
        email: 'fatima.sow@defense.gov.mr',
        nni: 'MR12345678902',
        institutId: instituts[0].id, // EEM
      },
      militaire: {
        matricule: 'MIL002',
        grade: 'CAPITAINE',
        categorie: 'OFFICIER',
        categorieOfficier: 'OFFICIER_SUBALTERNE',
        groupeSanguin: 'A_POSITIF',
        dateRecrutement: new Date('2005-09-01'),
        telephoneService: '+22245678902',
        dateDernierePromotion: new Date('2020-06-15'),
        situation: 'PRESENT',
        situationDepuis: new Date('2021-09-01'),
        fonctionId: fonctions[2].id, // Instructeur
        sousUniteId: sousUnites[0].id, // Division Pédagogique EEM
        armeId: armes[1].id, // Artillerie
        specialiteId: specialites[2].id, // Artillerie de campagne
      }
    },
    {
      personnel: {
        typePersonnel: 'MILITAIRE',
        nom: 'Camara',
        prenom: 'Ousmane',
        dateNaissance: new Date('1990-03-10'),
        lieuNaissance: 'Kaédi',
        telephone: '+22245678903',
        email: 'ousmane.camara@defense.gov.mr',
        nni: 'MR12345678903',
        institutId: instituts[1].id, // EMIA
      },
      militaire: {
        matricule: 'MIL003',
        grade: 'LIEUTENANT',
        categorie: 'OFFICIER',
        categorieOfficier: 'OFFICIER_SUBALTERNE',
        groupeSanguin: 'B_NEGATIF',
        dateRecrutement: new Date('2010-07-15'),
        telephoneService: '+22245678903',
        dateDernierePromotion: new Date('2019-05-20'),
        situation: 'MISSION',
        situationDetail: 'Mission de reconnaissance',
        situationDepuis: new Date('2023-02-15'),
        situationJusqua: new Date('2023-04-15'),
        fonctionId: fonctions[1].id, // Chef de section
        sousUniteId: sousUnites[2].id, // Division Pédagogique EMIA
        armeId: armes[0].id, // Infanterie
        specialiteId: specialites[1].id, // Infanterie mécanisée
      }
    },
    {
      personnel: {
        typePersonnel: 'MILITAIRE',
        nom: 'Barry',
        prenom: 'Amadou',
        dateNaissance: new Date('1988-07-22'),
        lieuNaissance: 'Rosso',
        telephone: '+22245678904',
        email: 'amadou.barry@defense.gov.mr',
        nni: 'MR12345678904',
        institutId: instituts[2].id, // CIN
      },
      militaire: {
        matricule: 'MIL004',
        grade: 'SERGENT_CHEF',
        categorie: 'SOUS_OFFICIER',
        categorieSousOfficier: 'SOUS_OFFICIER_SUBALTERNE',
        groupeSanguin: 'A_NEGATIF',
        dateRecrutement: new Date('2008-12-01'),
        telephoneService: '+22245678904',
        dateDernierePromotion: new Date('2018-10-10'),
        situation: 'PRESENT',
        situationDepuis: new Date('2022-06-01'),
        fonctionId: fonctions[2].id, // Instructeur
        sousUniteId: sousUnites[6].id, // Section Navigation CIN
        armeId: armes[2].id, // Marine
        specialiteId: specialites[4].id, // Navigation
      }
    },
    {
      personnel: {
        typePersonnel: 'MILITAIRE',
        nom: 'Diop',
        prenom: 'Ibrahim',
        dateNaissance: new Date('1992-04-18'),
        lieuNaissance: 'Nouakchott',
        telephone: '+22245678905',
        email: 'ibrahim.diop@defense.gov.mr',
        nni: 'MR12345678905',
        institutId: instituts[1].id, // EMIA
      },
      militaire: {
        matricule: 'MIL005',
        grade: 'ADJUDANT',
        categorie: 'SOUS_OFFICIER',
        categorieSousOfficier: 'SOUS_OFFICIER_SUPERIEUR',
        groupeSanguin: 'O_NEGATIF',
        dateRecrutement: new Date('2012-03-15'),
        telephoneService: '+22245678905',
        dateDernierePromotion: new Date('2021-12-01'),
        situation: 'FORMATION',
        situationDetail: 'Formation spécialisée',
        situationDepuis: new Date('2023-01-10'),
        situationJusqua: new Date('2023-05-10'),
        fonctionId: fonctions[4].id, // Opérateur
        sousUniteId: sousUnites[3].id, // Division Logistique EEM
        armeId: armes[4].id, // Génie
        specialiteId: specialites[8].id, // Génie de combat
      }
    }
  ];
  
  for (const data of militairesData) {
    // Create the personnel first
    const personnel = await prisma.personnel.create({
      data: data.personnel
    });
    console.log(`Created personnel (militaire): ${personnel.prenom} ${personnel.nom}`);
    personnels.push(personnel);
    
    // Then create the militaire with the personnel ID
    const militaire = await prisma.militaire.create({
      data: {
        ...data.militaire,
        personnelId: personnel.id
      }
    });
    console.log(`Created militaire: ${militaire.matricule}`);
    militaires.push(militaire);
  }
  
  // Create professeurs
  const professeursData = [
    {
      personnel: {
        typePersonnel: 'CIVIL_PROFESSEUR',
        nom: 'Ly',
        prenom: 'Mariama',
        dateNaissance: new Date('1980-09-12'),
        lieuNaissance: 'Nouakchott',
        telephone: '+22245678906',
        email: 'mariama.ly@education.gov.mr',
        nni: 'MR12345678906',
        institutId: instituts[0].id, // EEM
      },
      professeur: {
        specialite: 'Mathématiques',
        diplome: 'Doctorat en Mathématiques',
        position: 'Professeur principal',
        typeContrat: 'PERMANENT',
      }
    },
    {
      personnel: {
        typePersonnel: 'CIVIL_PROFESSEUR',
        nom: 'Bâ',
        prenom: 'Abdoulaye',
        dateNaissance: new Date('1975-05-28'),
        lieuNaissance: 'Kiffa',
        telephone: '+22245678907',
        email: 'abdoulaye.ba@education.gov.mr',
        nni: 'MR12345678907',
        institutId: instituts[1].id, // EMIA
      },
      professeur: {
        specialite: 'Histoire militaire',
        diplome: 'Master en Histoire',
        position: 'Professeur associé',
        typeContrat: 'CDI',
      }
    },
    {
      personnel: {
        typePersonnel: 'CIVIL_PROFESSEUR',
        nom: 'Touré',
        prenom: 'Aminata',
        dateNaissance: new Date('1985-11-03'),
        lieuNaissance: 'Nouadhibou',
        telephone: '+22245678908',
        email: 'aminata.toure@education.gov.mr',
        nni: 'MR12345678908',
        institutId: instituts[2].id, // CIN
      },
      professeur: {
        specialite: 'Ingénierie navale',
        diplome: 'Doctorat en Ingénierie',
        position: 'Professeur technique',
        typeContrat: 'VACATAIRE',
      }
    }
  ];
  
  for (const data of professeursData) {
    const personnel = await prisma.personnel.create({
      data: data.personnel
    });
    console.log(`Created personnel (professeur): ${personnel.prenom} ${personnel.nom}`);
    personnels.push(personnel);
    
    const professeur = await prisma.professeur.create({
      data: {
        ...data.professeur,
        personnelId: personnel.id
      }
    });
    console.log(`Created professeur: ${personnel.prenom} ${personnel.nom}`);
    professeurs.push(professeur);
  }
  
  // Create etudiants
  const etudiantsData = [
    {
      personnel: {
        typePersonnel: 'CIVIL_ETUDIANT',
        nom: 'Seck',
        prenom: 'Moussa',
        dateNaissance: new Date('2000-03-15'),
        lieuNaissance: 'Zouerate',
        telephone: '+22245678909',
        email: 'moussa.seck@etudiant.edu.mr',
        nni: 'MR12345678909',
        institutId: instituts[0].id, // EEM
      },
      etudiant: {
        matricule: 'ETU001',
        diplome: 'Baccalauréat',
        anneeEtude: 1,
        statut: 'PRESENT',
      }
    },
    {
      personnel: {
        typePersonnel: 'CIVIL_ETUDIANT',
        nom: 'Kane',
        prenom: 'Aïcha',
        dateNaissance: new Date('1999-07-22'),
        lieuNaissance: 'Atar',
        telephone: '+22245678910',
        email: 'aicha.kane@etudiant.edu.mr',
        nni: 'MR12345678910',
        institutId: instituts[1].id, // EMIA
      },
      etudiant: {
        matricule: 'ETU002',
        diplome: 'Licence en Sciences Politiques',
        anneeEtude: 2,
        statut: 'PRESENT',
      }
    },
    {
      personnel: {
        typePersonnel: 'CIVIL_ETUDIANT',
        nom: 'Fall',
        prenom: 'Omar',
        dateNaissance: new Date('1998-11-05'),
        lieuNaissance: 'Nouakchott',
        telephone: '+22245678911',
        email: 'omar.fall@etudiant.edu.mr',
        nni: 'MR12345678911',
        institutId: instituts[2].id, // CIN
      },
      etudiant: {
        matricule: 'ETU003',
        diplome: 'BTS en Mécanique',
        anneeEtude: 1,
        statut: 'STAGE',
      }
    }
  ];
  
  for (const data of etudiantsData) {
    const personnel = await prisma.personnel.create({
      data: data.personnel
    });
    console.log(`Created personnel (etudiant): ${personnel.prenom} ${personnel.nom}`);
    personnels.push(personnel);
    
    const etudiant = await prisma.etudiant.create({
      data: {
        ...data.etudiant,
        personnelId: personnel.id
      }
    });
    console.log(`Created etudiant: ${etudiant.matricule}`);
    etudiants.push(etudiant);
  }
  
  // Create employes
  const employesData = [
    {
      personnel: {
        typePersonnel: 'CIVIL_EMPLOYE',
        nom: 'Ndiaye',
        prenom: 'Fatou',
        dateNaissance: new Date('1985-09-18'),
        lieuNaissance: 'Nouakchott',
        telephone: '+22245678912',
        email: 'fatou.ndiaye@defense.gov.mr',
        nni: 'MR12345678912',
        institutId: instituts[0].id, // EEM
      },
      employe: {
        position: 'Secrétaire administrative',
        typeContrat: 'CDI',
        diplome: 'BTS Secrétariat',
      }
    },
    {
      personnel: {
        typePersonnel: 'CIVIL_EMPLOYE',
        nom: 'Tall',
        prenom: 'Mamadou',
        dateNaissance: new Date('1970-04-25'),
        lieuNaissance: 'Aleg',
        telephone: '+22245678913',
        email: 'mamadou.tall@defense.gov.mr',
        nni: 'MR12345678913',
        institutId: instituts[1].id, // EMIA
      },
      employe: {
        position: 'Responsable logistique',
        typeContrat: 'PERMANENT',
        diplome: 'Licence en Gestion',
      }
    }
  ];
  
  for (const data of employesData) {
    const personnel = await prisma.personnel.create({
      data: data.personnel
    });
    console.log(`Created personnel (employe): ${personnel.prenom} ${personnel.nom}`);
    personnels.push(personnel);
    
    const employe = await prisma.employe.create({
      data: {
        ...data.employe,
        personnelId: personnel.id
      }
    });
    console.log(`Created employe: ${personnel.prenom} ${personnel.nom}`);
    employes.push(employe);
  }
  
        // Create diplomes for personnel
  for (const personnel of personnels) {
    // Skip creating diplomes for students as they already have a diplome field
    if (personnel.typePersonnel === 'CIVIL_ETUDIANT') continue;
    
    const diplomesCount = Math.floor(Math.random() * 3) + 1; // 1 to 3 diplomes
    
    for (let i = 0; i < diplomesCount; i++) {
      let title, institution, type;
      
      if (personnel.typePersonnel === 'MILITAIRE') {
        type = 'MILITAIRE';
        title = ['Brevet militaire avancé', 'Formation de commandement', 'Stage de spécialisation'][i % 3];
        institution = ['École militaire de Nouakchott', 'Centre de formation tactique', 'Académie militaire internationale'][i % 3];
      } else {
        type = 'ACADEMIQUE';
        title = ['Licence', 'Master', 'Doctorat'][i % 3];
        institution = ['Université de Nouakchott', 'Institut Supérieur d\'Études', 'École Nationale d\'Administration'][i % 3];
      }
      
      const diplomeData = {
        titre: title,
        typeDiplome: type,
        institution: institution,
        dateObtention: new Date(2010 + i, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
        description: `${title} obtenu à ${institution}`,
        personnelId: personnel.id
      };
      
      await prisma.diplome.create({
        data: diplomeData
      });
      console.log(`Created diplome: ${diplomeData.titre} for ${personnel.prenom} ${personnel.nom}`);
    }
}
  
return { personnels, militaires, professeurs, etudiants, employes };
}

async function createMilitaireAssets(militaires) {
console.log('Creating militaire assets (decorations, notations, stages, historique)...');

// Create decorations
for (const militaire of militaires) {
  const decorationsCount = Math.floor(Math.random() * 3) + 1; // 1 to 3 decorations
  
  for (let i = 0; i < decorationsCount; i++) {
    const decoration = await prisma.decoration.create({
      data: {
        titre: ['Médaille du Mérite Militaire', 'Médaille de Bravoure', 'Médaille de Service', 'Croix de Guerre'][i % 4],
        description: 'Décoration attribuée pour service exceptionnel',
        dateObtention: new Date(2015 + i, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
        militaireId: militaire.id
      }
    });
    console.log(`Created decoration: ${decoration.titre} for militaire ${militaire.matricule}`);
  }
  
  // Create notations
  for (let year = 2020; year <= 2023; year++) {
    const notation = await prisma.notation.create({
      data: {
        typeNotation: 'ANNUELLE',
        date: new Date(year, 11, 31), // Dec 31 of each year
        note: 15 + Math.random() * 5, // Random note between 15 and 20
        observations: 'Excellent comportement et professionnalisme',
        notateur: 'Colonel Directeur',
        militaireId: militaire.id
      }
    });
    console.log(`Created notation for year ${year} for militaire ${militaire.matricule}`);
  }
  
  // Create stages militaires
  const stagesCount = Math.floor(Math.random() * 2) + 1; // 1 to 2 stages
  
  for (let i = 0; i < stagesCount; i++) {
    const stage = await prisma.stageMilitaire.create({
      data: {
        titre: ['Stage commando', 'Stage parachutiste', 'Stage tireur d\'élite', 'Stage transmission'][i % 4],
        description: 'Formation spécialisée pour renforcer les compétences',
        lieu: ['Nouakchott', 'Atar', 'Kiffa'][i % 3],
        dateDebut: new Date(2022, i, 10),
        dateFin: i === 0 ? new Date(2022, i + 2, 10) : null,
        statut: i === 0 ? 'EFFECTUE' : 'PLANIFIE',
        observations: 'Formation complétée avec succès',
        militaireId: militaire.id
      }
    });
    console.log(`Created stage: ${stage.titre} for militaire ${militaire.matricule}`);
  }
  
  // Create historique des situations
  if (militaire.situation !== 'PRESENT') {
    // Create a history entry for a past situation
    const situationHistorique = await prisma.situationHistorique.create({
      data: {
        situation: 'PRESENT',
        dateDebut: new Date(2022, 0, 1),
        dateFin: new Date(2022, 11, 31),
        observations: 'Situation régulière',
        militaireId: militaire.id
      }
    });
    console.log(`Created situation historique for militaire ${militaire.matricule}`);
  }
}
}

async function createAcademicAssets(professeurs, etudiants) {
console.log('Creating academic assets (classes, matieres, cours, notes)...');

// Create matieres for each professeur
for (const professeur of professeurs) {
  const matieresCount = Math.floor(Math.random() * 2) + 1; // 1 to 2 matieres
  
  for (let i = 0; i < matieresCount; i++) {
    let nom, code;
    
    if (professeur.specialite === 'Mathématiques') {
      nom = ['Algèbre', 'Analyse Mathématique', 'Statistiques'][i % 3];
      code = ['MATH101', 'MATH201', 'MATH301'][i % 3];
    } else if (professeur.specialite === 'Histoire militaire') {
      nom = ['Histoire des conflits', 'Stratégie militaire', 'Géopolitique'][i % 3];
      code = ['HIST101', 'HIST201', 'HIST301'][i % 3];
    } else if (professeur.specialite === 'Ingénierie navale') {
      nom = ['Systèmes de propulsion', 'Architecture navale', 'Navigation maritime'][i % 3];
      code = ['NAV101', 'NAV201', 'NAV301'][i % 3];
    } else {
      nom = ['Cours spécialisé ' + (i+1), 'Module technique ' + (i+1)][i % 2];
      code = ['SPEC' + (100 + i), 'TECH' + (100 + i)][i % 2];
    }
    
    const matiere = await prisma.matiere.create({
      data: {
        nom: nom,
        code: code,
        professeurId: professeur.id
      }
    });
    console.log(`Created matiere: ${matiere.nom} for professeur ${professeur.id}`);
  }
}

// Create classes
const classesData = [
  {
    nom: 'Première Année EEM',
    niveau: '1',
    anneeScolaire: '2022-2023'
  },
  {
    nom: 'Deuxième Année EEM',
    niveau: '2',
    anneeScolaire: '2022-2023'
  },
  {
    nom: 'Première Année EMIA',
    niveau: '1',
    anneeScolaire: '2022-2023'
  },
  {
    nom: 'Formation Technique CIN',
    niveau: '1',
    anneeScolaire: '2022-2023'
  }
];

const classes = [];

for (const classeData of classesData) {
  const classe = await prisma.classe.create({
    data: classeData
  });
  console.log(`Created classe: ${classe.nom}`);
  classes.push(classe);
}

// Assign professeurs to classes
for (let i = 0; i < professeurs.length; i++) {
  await prisma.professeur.update({
    where: { id: professeurs[i].id },
    data: {
      classes: {
        connect: [{ id: classes[i % classes.length].id }]
      }
    }
  });
  console.log(`Assigned professeur ${professeurs[i].id} to classe ${classes[i % classes.length].nom}`);
}

// Assign etudiants to classes
for (let i = 0; i < etudiants.length; i++) {
  await prisma.etudiant.update({
    where: { id: etudiants[i].id },
    data: {
      classes: {
        connect: [{ id: classes[i % classes.length].id }]
      }
    }
  });
  console.log(`Assigned etudiant ${etudiants[i].matricule} to classe ${classes[i % classes.length].nom}`);
}

// Create cours-classes
const matieres = await prisma.matiere.findMany();

for (const matiere of matieres) {
  for (const classe of classes) {
    // Only create cours for some matiere-classe combinations
    if (Math.random() > 0.7) continue;
    
    const coursClasse = await prisma.coursClasse.create({
      data: {
        typeCours: ['COURS', 'TP', 'TD'][Math.floor(Math.random() * 3)],
        nbHeures: 20 + Math.floor(Math.random() * 30), // 20 to 50 hours
        matiereId: matiere.id,
        classeId: classe.id
      }
    });
    console.log(`Created cours-classe for matiere ${matiere.nom} and classe ${classe.nom}`);
  }
}

// Create releves de notes and notes
for (const etudiant of etudiants) {
  const releveNote = await prisma.releveNote.create({
    data: {
      semestre: 'S1',
      anneeScolaire: '2022-2023',
      etudiantId: etudiant.id
    }
  });
  console.log(`Created releve de notes for etudiant ${etudiant.matricule}`);
  
  // Add notes for each subject
  const matieresCount = Math.floor(Math.random() * 4) + 3; // 3 to 6 subjects
  
  for (let i = 0; i < matieresCount; i++) {
    const note = await prisma.note.create({
      data: {
        matiere: ['Mathématiques', 'Informatique', 'Tactique militaire', 'Histoire', 'Géopolitique', 'Systèmes d\'armes'][i % 6],
        note: 10 + Math.random() * 10, // Note between 10 and 20
        coefficient: [1, 2, 3][i % 3],
        releveNoteId: releveNote.id
      }
    });
    console.log(`Created note for ${note.matiere} for etudiant ${etudiant.matricule}`);
  }
  
  // Create stage for etudiant
  if (etudiant.statut === 'STAGE') {
    const stage = await prisma.stage.create({
      data: {
        titre: 'Stage pratique',
        description: 'Stage de mise en application des connaissances',
        entreprise: 'Unité militaire d\'application',
        dateDebut: new Date(2023, 0, 15),
        dateFin: new Date(2023, 3, 15),
        etudiantId: etudiant.id
      }
    });
    console.log(`Created stage for etudiant ${etudiant.matricule}`);
  }
}
}

async function createDocuments(personnels, users) {
console.log('Creating documents...');

for (const personnel of personnels) {
  // Create 1-3 documents for each personnel
  const documentsCount = Math.floor(Math.random() * 3) + 1;
  
  for (let i = 0; i < documentsCount; i++) {
    const type = ['IDENTITE', 'DIPLOME', 'CONTRAT', 'MEDICAL', 'ADMINISTRATIF', 'AUTRE'][i % 6];
    let filename, path, description;
    
    switch (type) {
      case 'IDENTITE':
        filename = `CIN_${personnel.nom}_${personnel.prenom}.pdf`;
        path = `/documents/identite/${filename}`;
        description = 'Carte d\'identité nationale';
        break;
      case 'DIPLOME':
        filename = `DIPLOME_${personnel.nom}_${personnel.prenom}.pdf`;
        path = `/documents/diplomes/${filename}`;
        description = 'Diplôme obtenu';
        break;
      case 'CONTRAT':
        filename = `CONTRAT_${personnel.nom}_${personnel.prenom}.pdf`;
        path = `/documents/contrats/${filename}`;
        description = 'Contrat de travail';
        break;
      case 'MEDICAL':
        filename = `MEDICAL_${personnel.nom}_${personnel.prenom}.pdf`;
        path = `/documents/medical/${filename}`;
        description = 'Dossier médical';
        break;
      case 'ADMINISTRATIF':
        filename = `ADMIN_${personnel.nom}_${personnel.prenom}.pdf`;
        path = `/documents/admin/${filename}`;
        description = 'Document administratif';
        break;
      default:
        filename = `DOC_${personnel.nom}_${personnel.prenom}.pdf`;
        path = `/documents/autres/${filename}`;
        description = 'Document divers';
    }
    
    const document = await prisma.document.create({
      data: {
        typeDocument: type,
        nomFichier: filename,
        cheminFichier: path,
        description: description,
        personnelId: personnel.id,
        uploadePar: users[Math.floor(Math.random() * users.length)].id // Random user as uploader
      }
    });
    console.log(`Created document: ${document.nomFichier} for ${personnel.prenom} ${personnel.nom}`);
  }
}
}

async function createDailySituations(instituts, users) {
console.log('Creating daily situations...');

// Create daily situations for the past week for each institut
const today = new Date();

for (const institut of instituts) {
  for (let i = 7; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    
    // Random counts (more realistic would be to count from actual data)
    const militairesPresents = 50 + Math.floor(Math.random() * 20); // 50-70
    const civilsPresents = 20 + Math.floor(Math.random() * 10); // 20-30
    const professeursPresents = 5 + Math.floor(Math.random() * 5); // 5-10
    const etudiantsPresents = 30 + Math.floor(Math.random() * 15); // 30-45
    
    const dailySituation = await prisma.dailySituation.create({
      data: {
        dateRapport: date,
        militairesPresents: militairesPresents,
        civilsPresents: civilsPresents,
        professeursPresents: professeursPresents,
        etudiantsPresents: etudiantsPresents,
        remarques: i % 3 === 0 ? 'RAS' : 'Quelques absences justifiées',
        institutId: institut.id,
        creePar: users[i % users.length].id // Cyclic assignment of creators
      }
    });
    console.log(`Created daily situation for ${institut.nom} on ${date.toISOString().split('T')[0]}`);
  }
}
}

main()
.catch((e) => {
  console.error(e);
  process.exit(1);
})
.finally(async () => {
  // Close the Prisma client
  await prisma.$disconnect();
});