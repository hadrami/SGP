// src/services/employeService.js
const { PrismaClient } = require('@prisma/client');
const personnelService = require('./personnelService');

const prisma = new PrismaClient();

/**
 * Récupère tous les employés civils avec pagination
 * @param {Object} options - Options de filtrage et pagination
 * @returns {Promise<Object>} Liste des employés paginée
 */
async function getAllEmployes({ 
  page = 1, 
  limit = 10, 
  institutId = null, 
  search = null,
  typeContrat = null
}) {
  // Construire la requête de filtrage pour le personnel
  const where = {
    typePersonnel: 'CIVIL_EMPLOYE'
  };
  
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
  
  // Filtrage supplémentaire pour les employés
  const employeWhere = {};
  
  if (typeContrat) {
    employeWhere.typeContrat = typeContrat;
  }
  
  // Calculer le nombre total avec ces filtres
  const total = await prisma.personnel.count({
    where: {
      ...where,
      employe: employeWhere
    }
  });
  
  // Calculer l'offset pour la pagination
  const skip = (page - 1) * limit;
  
  // Récupérer les données paginées
  const employes = await prisma.personnel.findMany({
    where: {
      ...where,
      employe: employeWhere
    },
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
      employe: true
    },
    orderBy: {
      nom: 'asc'
    }
  });
  
  return {
    data: employes,
    pagination: {
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / limit)
    }
  };
}

/**
 * Récupère un employé civil par son ID
 * @param {string} id - L'ID du personnel employé
 * @returns {Promise<Object>} L'employé trouvé
 */
async function getEmployeById(id) {
  const personnel = await prisma.personnel.findFirst({
    where: { 
      id,
      typePersonnel: 'CIVIL_EMPLOYE'
    },
    include: {
      institut: true,
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
  
  if (!personnel) {
    return null;
  }
  
  return personnel;
}

/**
 * Crée un nouvel employé civil
 * @param {Object} employeData - Les données du nouvel employé
 * @returns {Promise<Object>} L'employé créé
 */
async function createEmploye(employeData) {
  const {
    // Données de base du personnel
    nom,
    prenom,
    dateNaissance,
    lieuNaissance,
    telephone,
    email,
    nni,
    institutId,
    
    // Données spécifiques à l'employé
    position,
    typeContrat,
    diplome,
    situation
  } = employeData;
  
  // Créer la transaction pour s'assurer que tout est créé correctement
  return await prisma.$transaction(async (tx) => {
    // 1. Créer d'abord l'entrée de personnel
    const personnelData = {
      typePersonnel: 'CIVIL_EMPLOYE',
      nom,
      prenom,
      dateNaissance,
      lieuNaissance,
      telephone,
      email,
      nni,
      institutId
    };
    
    // Vérifier si un personnel avec ce NNI existe déjà
    const existingPersonnel = await tx.personnel.findUnique({
      where: { nni }
    });
    
    if (existingPersonnel) {
      throw new Error(`Un personnel avec le NNI ${nni} existe déjà`);
    }
    
    // Créer le personnel
    const personnel = await tx.personnel.create({
      data: personnelData
    });
    
    // 2. Créer ensuite l'entrée d'employé
    const employe = await tx.employe.create({
      data: {
        position,
        typeContrat,
        diplome,
        situation: situation || 'PRESENT',
        personnelId: personnel.id
      }
    });
    
    // 3. Retourner le personnel complet avec les détails de l'employé
    return await tx.personnel.findUnique({
      where: { id: personnel.id },
      include: {
        institut: true,
        employe: true
      }
    });
  });
}

/**
 * Met à jour un employé civil existant
 * @param {string} id - L'ID du personnel employé à mettre à jour
 * @param {Object} employeData - Les nouvelles données de l'employé
 * @returns {Promise<Object>} L'employé mis à jour
 */
async function updateEmploye(id, employeData) {
  const {
    // Données de base du personnel
    nom,
    prenom,
    dateNaissance,
    lieuNaissance,
    telephone,
    email,
    institutId,
    
    // Données spécifiques à l'employé
    position,
    typeContrat,
    diplome,
    situation
  } = employeData;
  
  // Vérifier que l'employé existe
  const personnel = await prisma.personnel.findFirst({
    where: { 
      id,
      typePersonnel: 'CIVIL_EMPLOYE'
    },
    include: {
      employe: true
    }
  });
  
  if (!personnel || !personnel.employe) {
    throw new Error(`L'employé avec l'ID ${id} n'existe pas`);
  }
  
  // Mise à jour dans une transaction
  return await prisma.$transaction(async (tx) => {
    // 1. Mettre à jour les données du personnel
    const updatedPersonnel = await tx.personnel.update({
      where: { id },
      data: {
        nom,
        prenom,
        dateNaissance: dateNaissance ? new Date(dateNaissance) : null,
        lieuNaissance,
        telephone,
        email,
        institutId
      }
    });
    
    // 2. Mettre à jour les données de l'employé
    const updatedEmploye = await tx.employe.update({
      where: { personnelId: id },
      data: {
        position,
        typeContrat,
        diplome,
        situation
      }
    });
    
    // 3. Retourner le personnel mis à jour avec les détails de l'employé
    return await tx.personnel.findUnique({
      where: { id },
      include: {
        institut: true,
        employe: true
      }
    });
  });
}

/**
 * Supprime un employé civil
 * @param {string} id - L'ID du personnel employé à supprimer
 * @returns {Promise<Object>} L'employé supprimé
 */
async function deleteEmploye(id) {
  // Vérifier que l'employé existe
  const personnel = await prisma.personnel.findFirst({
    where: { 
      id,
      typePersonnel: 'CIVIL_EMPLOYE'
    },
    include: {
      employe: true
    }
  });
  
  if (!personnel || !personnel.employe) {
    throw new Error(`L'employé avec l'ID ${id} n'existe pas`);
  }
  
  // Supprimer l'employé (la suppression en cascade supprimera également l'entrée de personnel)
  return await personnelService.deletePersonnel(id);
}

/**
 * Met à jour la situation d'un employé
 * @param {string} id - L'ID du personnel employé
 * @param {string} situation - La nouvelle situation
 * @returns {Promise<Object>} L'employé mis à jour
 */
async function updateEmployeSituation(id, situation) {
  // Vérifier que l'employé existe
  const personnel = await prisma.personnel.findFirst({
    where: { 
      id,
      typePersonnel: 'CIVIL_EMPLOYE'
    },
    include: {
      employe: true
    }
  });
  
  if (!personnel || !personnel.employe) {
    throw new Error(`L'employé avec l'ID ${id} n'existe pas`);
  }
  
  // Mettre à jour la situation
  await prisma.employe.update({
    where: { personnelId: id },
    data: { situation }
  });
  
  // Retourner l'employé mis à jour
  return await prisma.personnel.findUnique({
    where: { id },
    include: {
      institut: true,
      employe: true
    }
  });
}

/**
 * Obtient des statistiques sur les employés par type de contrat
 * @param {string} institutId - ID de l'institut (optionnel)
 * @returns {Promise<Object>} Statistiques des employés
 */
async function getEmployeStats(institutId = null) {
  // Construire la condition de filtre
  const where = {
    typePersonnel: 'CIVIL_EMPLOYE'
  };
  
  if (institutId) {
    where.institutId = institutId;
  }
  
  // Compter le nombre total d'employés
  const totalEmployes = await prisma.personnel.count({
    where
  });
  
  // Compter par type de contrat
  const typeContratStats = await prisma.employe.groupBy({
    by: ['typeContrat'],
    _count: {
      personnelId: true
    },
    where: {
      personnel: where
    }
  });
  
  // Reformater les résultats
  const contratStats = {};
  
  typeContratStats.forEach(stat => {
    contratStats[stat.typeContrat] = stat._count.personnelId;
  });
  
  // Compter par situation
  const situationStats = await prisma.employe.groupBy({
    by: ['situation'],
    _count: {
      personnelId: true
    },
    where: {
      personnel: where
    }
  });
  
  // Reformater les résultats
  const statsParSituation = {};
  
  situationStats.forEach(stat => {
    statsParSituation[stat.situation] = stat._count.personnelId;
  });
  
  return {
    total: totalEmployes,
    parTypeContrat: contratStats,
    parSituation: statsParSituation
  };
}

module.exports = {
  getAllEmployes,
  getEmployeById,
  createEmploye,
  updateEmploye,
  deleteEmploye,
  updateEmployeSituation,
  getEmployeStats
};