// src/services/personnelService.js
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

/**
 * Récupère tous les personnels avec pagination
 * @param {Object} options - Options de filtrage et pagination
 * @returns {Promise<Object>} Liste des personnels paginée
 */
async function getAllPersonnel({ 
  page = 1, 
  limit = 10, 
  type = null, 
  institutId = null, 
  search = null 
}) {
  // Construire la requête de filtrage
  const where = {};
  
  if (type) {
    where.typePersonnel = type;
  }
  
  if (institutId) {
    where.institutId = institutId;
  }
  
  if (search) {
    where.OR = [
      { nom: { contains: search, mode: 'insensitive' } },
      { prenom: { contains: search, mode: 'insensitive' } },
      { nni: { contains: search } }
    ];
  }
  
  // Calculer le nombre total avec ces filtres
  const total = await prisma.personnel.count({ where });
  
  // Calculer l'offset pour la pagination
  const skip = (page - 1) * limit;
  
  // Récupérer les données paginées
  const personnel = await prisma.personnel.findMany({
    where,
    skip,
    take: limit,
    include: {
      institut: {
        select: {
          id: true,
          nom: true,
          code: true
        }
      },
      militaire: true,
      professeur: true,
      etudiant: true,
      employe: true
    },
    orderBy: {
      nom: 'asc'
    }
  });
  
  return {
    data: personnel,
    pagination: {
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / limit)
    }
  };
}

/**
 * Récupère un membre du personnel par son ID
 * @param {string} id - L'ID du personnel
 * @returns {Promise<Object>} Le personnel trouvé
 */
async function getPersonnelById(id) {
  return await prisma.personnel.findUnique({
    where: { id },
    include: {
      institut: {
        select: {
          id: true,
          nom: true,
          code: true
        }
      },
      militaire: {
        include: {
          position: true
        }
      },
      professeur: {
        include: {
          matieres: true,
          classes: true
        }
      },
      etudiant: {
        include: {
          classes: true
        }
      },
      employe: true,
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
  });
}

/**
 * Récupère un membre du personnel par son NNI
 * @param {string} nni - Le NNI du personnel
 * @returns {Promise<Object>} Le personnel trouvé
 */
async function getPersonnelByNNI(nni) {
  return await prisma.personnel.findUnique({
    where: { nni },
    include: {
      institut: true,
      militaire: true,
      professeur: true,
      etudiant: true,
      employe: true
    }
  });
}

/**
 * Crée un nouveau personnel (commun à tous les types)
 * @param {Object} personnelData - Les données du personnel
 * @returns {Promise<Object>} Le personnel créé
 */
async function createPersonnel(personnelData) {
  const {
    typePersonnel,
    nom,
    prenom,
    dateNaissance,
    lieuNaissance,
    telephone,
    email,
    nni,
    institutId
  } = personnelData;
  
  // Vérifier si un personnel avec ce NNI existe déjà
  const existingPersonnel = await prisma.personnel.findUnique({
    where: { nni }
  });
  
  if (existingPersonnel) {
    throw new Error(`Un personnel avec le NNI ${nni} existe déjà`);
  }
  
  // Vérifier que l'institut existe
  const institut = await prisma.institut.findUnique({
    where: { id: institutId }
  });
  
  if (!institut) {
    throw new Error(`L'institut avec l'ID ${institutId} n'existe pas`);
  }
  
  // Créer le personnel de base
  return await prisma.personnel.create({
    data: {
      typePersonnel,
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
}

/**
 * Met à jour un personnel existant
 * @param {string} id - L'ID du personnel à mettre à jour
 * @param {Object} personnelData - Les nouvelles données du personnel
 * @returns {Promise<Object>} Le personnel mis à jour
 */
async function updatePersonnel(id, personnelData) {
  const {
    nom,
    prenom,
    dateNaissance,
    lieuNaissance,
    telephone,
    email,
    institutId
  } = personnelData;
  
  // Vérifier que le personnel existe
  const personnel = await prisma.personnel.findUnique({
    where: { id }
  });
  
  if (!personnel) {
    throw new Error(`Le personnel avec l'ID ${id} n'existe pas`);
  }
  
  // Vérifier que l'institut existe si spécifié
  if (institutId) {
    const institut = await prisma.institut.findUnique({
      where: { id: institutId }
    });
    
    if (!institut) {
      throw new Error(`L'institut avec l'ID ${institutId} n'existe pas`);
    }
  }
  
  // Mettre à jour le personnel
  return await prisma.personnel.update({
    where: { id },
    data: {
      nom,
      prenom,
      dateNaissance: dateNaissance ? new Date(dateNaissance) : personnel.dateNaissance,
      lieuNaissance,
      telephone,
      email,
      institutId: institutId || personnel.institutId
    },
    include: {
      institut: {
        select: {
          id: true,
          nom: true,
          code: true
        }
      }
    }
  });
}

/**
 * Supprime un personnel
 * @param {string} id - L'ID du personnel à supprimer
 * @returns {Promise<Object>} Le personnel supprimé
 */
async function deletePersonnel(id) {
  // Vérifier que le personnel existe
  const personnel = await prisma.personnel.findUnique({
    where: { id },
    include: {
      documents: true
    }
  });
  
  if (!personnel) {
    throw new Error(`Le personnel avec l'ID ${id} n'existe pas`);
  }
  
  // Si le personnel a des documents, les supprimer d'abord
  if (personnel.documents.length > 0) {
    await prisma.document.deleteMany({
      where: { personnelId: id }
    });
  }
  
  // Supprimer le personnel (la cascade supprimera les entités liées comme militaire, professeur, etc.)
  return await prisma.personnel.delete({
    where: { id }
  });
}

/**
 * Cherche du personnel selon différents critères
 * @param {string} query - La chaîne de recherche (nom, prénom, NNI)
 * @returns {Promise<Array>} Liste des personnels correspondant à la recherche
 */
async function searchPersonnel(query) {
  if (!query || query.length < 3) {
    throw new Error('La recherche doit contenir au moins 3 caractères');
  }
  
  return await prisma.personnel.findMany({
    where: {
      OR: [
        { nom: { contains: query, mode: 'insensitive' } },
        { prenom: { contains: query, mode: 'insensitive' } },
        { nni: { contains: query } }
      ]
    },
    include: {
      institut: {
        select: {
          id: true,
          nom: true,
          code: true
        }
      },
      militaire: {
        select: {
          matricule: true,
          grade: true
        }
      },
      professeur: {
        select: {
          specialite: true
        }
      },
      etudiant: {
        select: {
          matricule: true,
          anneeEtude: true
        }
      },
      employe: {
        select: {
          position: true
        }
      }
    },
    take: 20 // Limiter les résultats
  });
}

module.exports = {
  getAllPersonnel,
  getPersonnelById,
  getPersonnelByNNI,
  createPersonnel,
  updatePersonnel,
  deletePersonnel,
  searchPersonnel
};