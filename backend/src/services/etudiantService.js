// src/services/etudiantService.js
const { PrismaClient } = require('@prisma/client');
const personnelService = require('./personnelService');

const prisma = new PrismaClient();

/**
 * Récupère tous les étudiants avec pagination
 * @param {Object} options - Options de filtrage et pagination
 * @returns {Promise<Object>} Liste des étudiants paginée
 */
async function getAllEtudiants({ 
  page = 1, 
  limit = 10, 
  institutId = null, 
  statut = null,
  classeId = null,
  anneeEtude = null,
  search = null 
}) {
  // Construire la requête de filtrage
  const where = {
    personnel: {
      typePersonnel: 'CIVIL_ETUDIANT'
    }
  };
  
  if (institutId) {
    where.personnel.institutId = institutId;
  }
  
  if (statut) {
    where.statut = statut;
  }
  
  if (anneeEtude) {
    where.anneeEtude = parseInt(anneeEtude);
  }
  
  if (classeId) {
    where.classes = {
      some: { id: classeId }
    };
  }
  
  if (search) {
    where.OR = [
      { 
        personnel: {
          nom: { contains: search, mode: 'insensitive' } 
        }
      },
      { 
        personnel: {
          prenom: { contains: search, mode: 'insensitive' } 
        }
      },
      { matricule: { contains: search } }
    ];
  }
  
  // Calculer le nombre total avec ces filtres
  const total = await prisma.etudiant.count({ where });
  
  // Calculer l'offset pour la pagination
  const skip = (page - 1) * limit;
  
  // Récupérer les données paginées
  const etudiants = await prisma.etudiant.findMany({
    where,
    skip,
    take: limit,
    include: {
      personnel: {
        include: {
          institut: {
            select: {
              id: true,
              nom: true,
              code: true
            }
          }
        }
      },
      classes: {
        select: {
          id: true,
          nom: true,
          niveau: true,
          anneeScolaire: true
        }
      }
    },
    orderBy: {
      personnel: {
        nom: 'asc'
      }
    }
  });
  
  return {
    data: etudiants,
    pagination: {
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / limit)
    }
  };
}

/**
 * Récupère un étudiant par son ID
 * @param {string} id - L'ID de l'étudiant
 * @returns {Promise<Object>} L'étudiant trouvé
 */
async function getEtudiantById(id) {
  return await prisma.etudiant.findUnique({
    where: { id },
    include: {
      personnel: {
        include: {
          institut: true,
          documents: {
            include: {
              uploadeur: {
                select: {
                  id: true,
                  name: true
                }
              }
            }
          }
        }
      },
      classes: true,
      relevesNotes: {
        include: {
          notes: true
        }
      },
      stages: true
    }
  });
}

/**
 * Récupère un étudiant par son matricule
 * @param {string} matricule - Le matricule de l'étudiant
 * @returns {Promise<Object>} L'étudiant trouvé
 */
async function getEtudiantByMatricule(matricule) {
  return await prisma.etudiant.findUnique({
    where: { matricule },
    include: {
      personnel: {
        include: {
          institut: true
        }
      },
      classes: true
    }
  });
}

/**
 * Crée un nouvel étudiant
 * @param {Object} etudiantData - Les données de l'étudiant à créer
 * @returns {Promise<Object>} L'étudiant créé
 */
async function createEtudiant(etudiantData) {
  const {
    // Données du personnel
    nom,
    prenom,
    dateNaissance,
    lieuNaissance,
    telephone,
    email,
    nni,
    institutId,
    
    // Données spécifiques à l'étudiant
    matricule,
    diplome,
    anneeEtude,
    statut = 'PRESENT',
    classeIds = []
  } = etudiantData;
  
  // Vérifier si un étudiant avec ce matricule existe déjà
  const existingEtudiant = await prisma.etudiant.findUnique({
    where: { matricule }
  });
  
  if (existingEtudiant) {
    throw new Error(`Un étudiant avec le matricule ${matricule} existe déjà`);
  }
  
  // Vérifier que les classes existent si spécifiées
  if (classeIds.length > 0) {
    const classes = await prisma.classe.findMany({
      where: {
        id: {
          in: classeIds
        }
      }
    });
    
    if (classes.length !== classeIds.length) {
      throw new Error('Une ou plusieurs classes spécifiées n\'existent pas');
    }
  }
  
  // Utiliser une transaction pour créer le personnel et l'étudiant ensemble
  return await prisma.$transaction(async (tx) => {
    // Créer d'abord l'enregistrement de base du personnel
    const personnel = await tx.personnel.create({
      data: {
        typePersonnel: 'CIVIL_ETUDIANT',
        nom,
        prenom,
        dateNaissance: dateNaissance ? new Date(dateNaissance) : null,
        lieuNaissance,
        telephone,
        email,
        nni,
        institutId
      }
    });
    
    // Créer ensuite l'étudiant lié à ce personnel
    const etudiant = await tx.etudiant.create({
      data: {
        matricule,
        diplome,
        anneeEtude: parseInt(anneeEtude),
        statut,
        personnelId: personnel.id,
        classes: classeIds.length > 0 ? {
          connect: classeIds.map(id => ({ id }))
        } : undefined
      },
      include: {
        personnel: {
          include: {
            institut: true
          }
        },
        classes: true
      }
    });
    
    return etudiant;
  });
}

/**
 * Met à jour un étudiant existant
 * @param {string} id - L'ID de l'étudiant à mettre à jour
 * @param {Object} etudiantData - Les nouvelles données de l'étudiant
 * @returns {Promise<Object>} L'étudiant mis à jour
 */
async function updateEtudiant(id, etudiantData) {
  const {
    // Données du personnel
    nom,
    prenom,
    dateNaissance,
    lieuNaissance,
    telephone,
    email,
    institutId,
    
    // Données spécifiques à l'étudiant
    diplome,
    anneeEtude,
    statut,
    classeIds
  } = etudiantData;
  
  // Vérifier que l'étudiant existe
  const etudiant = await prisma.etudiant.findUnique({
    where: { id },
    include: {
      personnel: true,
      classes: true
    }
  });
  
  if (!etudiant) {
    throw new Error(`L'étudiant avec l'ID ${id} n'existe pas`);
  }
  
  // Vérifier que les classes existent si spécifiées
  let classesToConnect = [];
  if (classeIds && classeIds.length > 0) {
    const classes = await prisma.classe.findMany({
      where: {
        id: {
          in: classeIds
        }
      }
    });
    
    if (classes.length !== classeIds.length) {
      throw new Error('Une ou plusieurs classes spécifiées n\'existent pas');
    }
    
    classesToConnect = classeIds.map(id => ({ id }));
  }
  
  // Utiliser une transaction pour mettre à jour le personnel et l'étudiant ensemble
  return await prisma.$transaction(async (tx) => {
    // Mettre à jour le personnel
    if (nom || prenom || dateNaissance || lieuNaissance || telephone || email || institutId) {
      await tx.personnel.update({
        where: { id: etudiant.personnel.id },
        data: {
          nom: nom || undefined,
          prenom: prenom || undefined,
          dateNaissance: dateNaissance ? new Date(dateNaissance) : undefined,
          lieuNaissance: lieuNaissance || undefined,
          telephone: telephone || undefined,
          email: email || undefined,
          institutId: institutId || undefined
        }
      });
    }
    
    // Mettre à jour l'étudiant
    return await tx.etudiant.update({
      where: { id },
      data: {
        diplome: diplome || undefined,
        anneeEtude: anneeEtude ? parseInt(anneeEtude) : undefined,
        statut: statut || undefined,
        classes: classeIds ? {
          set: classesToConnect
        } : undefined
      },
      include: {
        personnel: {
          include: {
            institut: true
          }
        },
        classes: true
      }
    });
  });
}

/**
 * Met à jour le statut d'un étudiant
 * @param {string} id - L'ID de l'étudiant
 * @param {string} statut - Le nouveau statut
 * @returns {Promise<Object>} L'étudiant mis à jour
 */
async function updateEtudiantStatut(id, statut) {
  // Vérifier que le statut est valide
  const statutsValides = ['PRESENT', 'ABSENT', 'CONSULTATION_MEDICALE', 'SANCTION', 'STAGE'];
  if (!statutsValides.includes(statut)) {
    throw new Error(`Statut invalide. Les statuts valides sont: ${statutsValides.join(', ')}`);
  }
  
  // Mettre à jour le statut
  return await prisma.etudiant.update({
    where: { id },
    data: { statut },
    include: {
      personnel: {
        select: {
          nom: true,
          prenom: true
        }
      }
    }
  });
}

/**
 * Ajoute un étudiant à une classe
 * @param {string} etudiantId - L'ID de l'étudiant
 * @param {string} classeId - L'ID de la classe
 * @returns {Promise<Object>} L'étudiant mis à jour
 */
async function ajouterEtudiantAClasse(etudiantId, classeId) {
  // Vérifier que l'étudiant existe
  const etudiant = await prisma.etudiant.findUnique({
    where: { id: etudiantId },
    include: {
      classes: true
    }
  });
  
  if (!etudiant) {
    throw new Error(`L'étudiant avec l'ID ${etudiantId} n'existe pas`);
  }
  
  // Vérifier que la classe existe
  const classe = await prisma.classe.findUnique({
    where: { id: classeId }
  });
  
  if (!classe) {
    throw new Error(`La classe avec l'ID ${classeId} n'existe pas`);
  }
  
  // Vérifier si l'étudiant est déjà dans cette classe
  if (etudiant.classes.some(c => c.id === classeId)) {
    throw new Error(`L'étudiant est déjà inscrit dans cette classe`);
  }
  
  // Ajouter l'étudiant à la classe
  return await prisma.etudiant.update({
    where: { id: etudiantId },
    data: {
      classes: {
        connect: { id: classeId }
      }
    },
    include: {
      personnel: {
        select: {
          nom: true,
          prenom: true
        }
      },
      classes: true
    }
  });
}

/**
 * Retire un étudiant d'une classe
 * @param {string} etudiantId - L'ID de l'étudiant
 * @param {string} classeId - L'ID de la classe
 * @returns {Promise<Object>} L'étudiant mis à jour
 */
async function retirerEtudiantDeClasse(etudiantId, classeId) {
  // Vérifier que l'étudiant existe
  const etudiant = await prisma.etudiant.findUnique({
    where: { id: etudiantId },
    include: {
      classes: true
    }
  });
  
  if (!etudiant) {
    throw new Error(`L'étudiant avec l'ID ${etudiantId} n'existe pas`);
  }
  
  // Vérifier que la classe existe
  const classe = await prisma.classe.findUnique({
    where: { id: classeId }
  });
  
  if (!classe) {
    throw new Error(`La classe avec l'ID ${classeId} n'existe pas`);
  }
  
  // Vérifier si l'étudiant est dans cette classe
  if (!etudiant.classes.some(c => c.id === classeId)) {
    throw new Error(`L'étudiant n'est pas inscrit dans cette classe`);
  }
  
  // Retirer l'étudiant de la classe
  return await prisma.etudiant.update({
    where: { id: etudiantId },
    data: {
      classes: {
        disconnect: { id: classeId }
      }
    },
    include: {
      personnel: {
        select: {
          nom: true,
          prenom: true
        }
      },
      classes: true
    }
  });
}

/**
 * Crée un nouveau relevé de notes pour un étudiant
 * @param {string} etudiantId - L'ID de l'étudiant
 * @param {Object} releveData - Les données du relevé
 * @returns {Promise<Object>} Le relevé créé
 */
async function creerReleveNotes(etudiantId, releveData) {
  const {
    semestre,
    anneeScolaire,
    notes = []
  } = releveData;
  
  // Vérifier que l'étudiant existe
  const etudiant = await prisma.etudiant.findUnique({
    where: { id: etudiantId }
  });
  
  if (!etudiant) {
    throw new Error(`L'étudiant avec l'ID ${etudiantId} n'existe pas`);
  }
  
  // Vérifier que les notes sont valides
  for (const note of notes) {
    if (!note.matiere || note.note === undefined || note.coefficient === undefined) {
      throw new Error('Chaque note doit avoir une matière, une note et un coefficient');
    }
    
    if (note.note < 0 || note.note > 20) {
      throw new Error('La note doit être comprise entre 0 et 20');
    }
    
    if (note.coefficient <= 0) {
      throw new Error('Le coefficient doit être positif');
    }
  }
  
  // Créer le relevé de notes
  return await prisma.releveNote.create({
    data: {
      semestre,
      anneeScolaire,
      etudiantId,
      notes: {
        create: notes.map(note => ({
          matiere: note.matiere,
          note: parseFloat(note.note),
          coefficient: parseFloat(note.coefficient)
        }))
      }
    },
    include: {
      notes: true,
      etudiant: {
        include: {
          personnel: {
            select: {
              nom: true,
              prenom: true
            }
          }
        }
      }
    }
  });
}

/**
 * Crée un nouveau stage pour un étudiant
 * @param {string} etudiantId - L'ID de l'étudiant
 * @param {Object} stageData - Les données du stage
 * @returns {Promise<Object>} Le stage créé
 */
async function creerStage(etudiantId, stageData) {
  const {
    titre,
    description,
    entreprise,
    dateDebut,
    dateFin,
    evaluation
  } = stageData;
  
  // Vérifier que l'étudiant existe
  const etudiant = await prisma.etudiant.findUnique({
    where: { id: etudiantId }
  });
  
  if (!etudiant) {
    throw new Error(`L'étudiant avec l'ID ${etudiantId} n'existe pas`);
  }
  
  // Vérifier les dates
  const debut = new Date(dateDebut);
  const fin = new Date(dateFin);
  
  if (debut > fin) {
    throw new Error('La date de début doit être antérieure à la date de fin');
  }
  
  // Créer le stage
  const stage = await prisma.stage.create({
    data: {
      titre,
      description,
      entreprise,
      dateDebut: debut,
      dateFin: fin,
      evaluation,
      etudiantId
    },
    include: {
      etudiant: {
        include: {
          personnel: {
            select: {
              nom: true,
              prenom: true
            }
          }
        }
      }
    }
  });
  
  // Mettre à jour le statut de l'étudiant si le stage est en cours
  const now = new Date();
  if (debut <= now && fin >= now) {
    await prisma.etudiant.update({
      where: { id: etudiantId },
      data: { statut: 'STAGE' }
    });
  }
  
  return stage;
}

/**
 * Récupère les statistiques des étudiants
 * @param {string} institutId - L'ID de l'institut (optionnel)
 * @returns {Promise<Object>} Les statistiques
 */
async function getEtudiantStats(institutId = null) {
  // Construire la requête de filtrage
  const where = {
    personnel: {
      typePersonnel: 'CIVIL_ETUDIANT'
    }
  };
  
  if (institutId) {
    where.personnel.institutId = institutId;
  }
  
  // Compter les étudiants par statut
  const statuts = await prisma.etudiant.groupBy({
    by: ['statut'],
    where,
    _count: {
      statut: true
    }
  });
  
  // Compter les étudiants par année d'étude
  const annees = await prisma.etudiant.groupBy({
    by: ['anneeEtude'],
    where,
    _count: {
      anneeEtude: true
    }
  });
  
  // Compter le total d'étudiants
  const total = await prisma.etudiant.count({ where });
  
  return {
    total,
    parStatut: statuts.reduce((acc, item) => {
      acc[item.statut] = item._count.statut;
      return acc;
    }, {}),
    parAnnee: annees.reduce((acc, item) => {
      acc[`année${item.anneeEtude}`] = item._count.anneeEtude;
      return acc;
    }, {})
  };
}

module.exports = {
  getAllEtudiants,
  getEtudiantById,
  getEtudiantByMatricule,
  createEtudiant,
  updateEtudiant,
  updateEtudiantStatut,
  ajouterEtudiantAClasse,
  retirerEtudiantDeClasse,
  creerReleveNotes,
  creerStage,
  getEtudiantStats
};