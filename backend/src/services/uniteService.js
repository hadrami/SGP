// src/services/uniteService.js
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

/**
 * Récupère toutes les unités avec leurs détails spécifiques selon le type
 * @returns {Promise<Array>} La liste des unités
 */
async function getAllUnites() {
  console.log("Fetching all unites with type-specific details...");
  
  const unites = await prisma.unite.findMany({
    include: {
      institut: true,
      dct: true,
      pc: true,
      directeur: {
        select: {
          id: true,
          name: true,
          identifier: true
        }
      }
    }
  });
  
  console.log(`Found ${unites.length} unites`);
  return unites;
}

/**
 * Récupère une unité par son ID avec ses détails spécifiques selon le type
 * @param {string} id - L'ID de l'unité
 * @returns {Promise<Object>} L'unité trouvée
 */
async function getUniteById(id) {
  console.log(`Fetching unite with ID: ${id}`);
  
  const unite = await prisma.unite.findUnique({
    where: { id },
    include: {
      institut: true,
      dct: true,
      pc: true,
      directeur: {
        select: {
          id: true,
          name: true,
          identifier: true
        }
      },
      sousUnites: true,
      personnels: {
        select: {
          id: true,
          nom: true,
          prenom: true,
          typePersonnel: true
        },
        take: 10 // Limit to avoid large responses
      }
    }
  });
  
  if (!unite) {
    console.log(`No unite found with ID: ${id}`);
  } else {
    console.log(`Found unite: ${unite.nom} (${unite.type})`);
  }
  
  return unite;
}

/**
 * Récupère une unité par son code avec ses détails spécifiques selon le type
 * @param {string} code - Le code de l'unité
 * @returns {Promise<Object>} L'unité trouvée
 */
async function getUniteByCode(code) {
  console.log(`Fetching unite with code: ${code}`);
  
  const unite = await prisma.unite.findUnique({
    where: { code },
    include: {
      institut: true,
      dct: true,
      pc: true,
      directeur: {
        select: {
          id: true,
          name: true,
          identifier: true
        }
      }
    }
  });
  
  if (!unite) {
    console.log(`No unite found with code: ${code}`);
  } else {
    console.log(`Found unite: ${unite.nom} (${unite.type})`);
  }
  
  return unite;
}

/**
 * Récupère les sous-unités d'une unité
 * @param {string} uniteId - L'ID de l'unité
 * @returns {Promise<Array>} La liste des sous-unités de l'unité
 */
async function getSousUnitesByUnite(uniteId) {
  console.log(`Fetching sous-unites for unite ID: ${uniteId}`);
  
  // Vérifier si l'unité existe
  const unite = await prisma.unite.findUnique({
    where: { id: uniteId }
  });
  
  if (!unite) {
    throw new Error(`L'unité avec l'ID ${uniteId} n'existe pas`);
  }
  
  const sousUnites = await prisma.sousUnite.findMany({
    where: { uniteId }
  });
  
  console.log(`Found ${sousUnites.length} sous-unites for unite ID: ${uniteId}`);
  return sousUnites;
}

/**
 * Crée une nouvelle unité avec les détails spécifiques à son type
 * @param {Object} uniteData - Les données de l'unité à créer
 * @returns {Promise<Object>} L'unité créée
 */
async function createUnite(uniteData) {
  console.log(`Creating new unite of type: ${uniteData.type}`);
  
  const { 
    nom, 
    code, 
    description, 
    type, 
    directeurId,
    // Fields for INSTITUT type
    emplacement,
    anneeEtude,
    specialite,
    // Fields for DCT type
    domaine,
    niveau,
    // Fields for PC type
    typePC,
    zoneOperation
  } = uniteData;
  
  // Vérifier si le type est valide
  if (!['INSTITUT', 'DCT', 'PC'].includes(type)) {
    throw new Error(`Le type d'unité '${type}' n'est pas valide. Types valides: INSTITUT, DCT, PC`);
  }
  
  // Vérifier si une unité avec ce code existe déjà
  const existingUnite = await prisma.unite.findUnique({
    where: { code }
  });
  
  if (existingUnite) {
    throw new Error(`Une unité avec le code ${code} existe déjà`);
  }
  
  // Créer la structure de données selon le type
  const createData = {
    nom,
    code,
    description,
    type,
    directeurId
  };
  
  // Ajouter les détails spécifiques au type
  if (type === 'INSTITUT' && emplacement) {
    createData.institut = {
      create: {
        emplacement,
        anneeEtude: anneeEtude || null,
        specialite: specialite || null
      }
    };
  } else if (type === 'DCT') {
    createData.dct = {
      create: {
        domaine: domaine || null,
        niveau: niveau || null
      }
    };
  } else if (type === 'PC') {
    createData.pc = {
      create: {
        typePC: typePC || null,
        zoneOperation: zoneOperation || null,
        niveau: niveau || null
      }
    };
  }
  
  const newUnite = await prisma.unite.create({
    data: createData,
    include: {
      institut: true,
      dct: true,
      pc: true,
      directeur: {
        select: {
          id: true,
          name: true,
          identifier: true
        }
      }
    }
  });
  
  console.log(`Created unite: ${newUnite.nom} (${newUnite.type}) with ID: ${newUnite.id}`);
  return newUnite;
}

/**
 * Met à jour une unité existante et ses détails spécifiques selon le type
 * @param {string} id - L'ID de l'unité à mettre à jour
 * @param {Object} uniteData - Les nouvelles données de l'unité
 * @returns {Promise<Object>} L'unité mise à jour
 */
async function updateUnite(id, uniteData) {
  console.log(`Updating unite with ID: ${id}`);
  
  const { 
    nom, 
    description, 
    directeurId,
    // Fields for INSTITUT type
    emplacement,
    anneeEtude,
    specialite,
    // Fields for DCT type
    domaine,
    niveau,
    // Fields for PC type
    typePC,
    zoneOperation
  } = uniteData;
  
  // Vérifier si l'unité existe
  const unite = await prisma.unite.findUnique({
    where: { id },
    include: {
      institut: true,
      dct: true,
      pc: true
    }
  });
  
  if (!unite) {
    throw new Error(`L'unité avec l'ID ${id} n'existe pas`);
  }
  
  // Préparer les données de mise à jour
  const updateData = {
    nom: nom || undefined,
    description: description !== undefined ? description : undefined,
    directeurId: directeurId !== undefined ? directeurId : undefined
  };
  
  // Mettre à jour les détails spécifiques au type
  if (unite.type === 'INSTITUT' && unite.institut) {
    if (emplacement !== undefined || anneeEtude !== undefined || specialite !== undefined) {
      updateData.institut = {
        update: {
          emplacement: emplacement !== undefined ? emplacement : undefined,
          anneeEtude: anneeEtude !== undefined ? anneeEtude : undefined,
          specialite: specialite !== undefined ? specialite : undefined
        }
      };
    }
  } else if (unite.type === 'DCT' && unite.dct) {
    if (domaine !== undefined || niveau !== undefined) {
      updateData.dct = {
        update: {
          domaine: domaine !== undefined ? domaine : undefined,
          niveau: niveau !== undefined ? niveau : undefined
        }
      };
    }
  } else if (unite.type === 'PC' && unite.pc) {
    if (typePC !== undefined || zoneOperation !== undefined || niveau !== undefined) {
      updateData.pc = {
        update: {
          typePC: typePC !== undefined ? typePC : undefined,
          zoneOperation: zoneOperation !== undefined ? zoneOperation : undefined,
          niveau: niveau !== undefined ? niveau : undefined
        }
      };
    }
  }
  
  const updatedUnite = await prisma.unite.update({
    where: { id },
    data: updateData,
    include: {
      institut: true,
      dct: true,
      pc: true,
      directeur: {
        select: {
          id: true,
          name: true,
          identifier: true
        }
      }
    }
  });
  
  console.log(`Updated unite: ${updatedUnite.nom} (${updatedUnite.type})`);
  return updatedUnite;
}

/**
 * Supprime une unité
 * @param {string} id - L'ID de l'unité à supprimer
 * @returns {Promise<Object>} L'unité supprimée
 */
async function deleteUnite(id) {
  console.log(`Deleting unite with ID: ${id}`);
  
  // Vérifier si l'unité existe
  const unite = await prisma.unite.findUnique({
    where: { id },
    include: {
      sousUnites: true,
      personnels: true
    }
  });
  
  if (!unite) {
    throw new Error(`L'unité avec l'ID ${id} n'existe pas`);
  }
  
  // Vérifier s'il y a des sous-unités liées à cette unité
  if (unite.sousUnites.length > 0) {
    throw new Error(`Impossible de supprimer l'unité car elle possède ${unite.sousUnites.length} sous-unités`);
  }
  
  // Vérifier s'il y a du personnel lié à cette unité
  if (unite.personnels.length > 0) {
    throw new Error(`Impossible de supprimer l'unité car elle possède ${unite.personnels.length} membres du personnel`);
  }
  
  // Supprimer les détails spécifiques au type avec l'unité
  if (unite.type === 'INSTITUT') {
    await prisma.institut.deleteMany({
      where: { uniteId: id }
    });
  } else if (unite.type === 'DCT') {
    await prisma.dCT.deleteMany({
      where: { uniteId: id }
    });
  } else if (unite.type === 'PC') {
    await prisma.pC.deleteMany({
      where: { uniteId: id }
    });
  }
  
  const deletedUnite = await prisma.unite.delete({
    where: { id }
  });
  
  console.log(`Deleted unite: ${deletedUnite.nom} (${deletedUnite.type})`);
  return deletedUnite;
}

/**
 * Récupère le personnel d'une unité
 * @param {string} uniteId - L'ID de l'unité
 * @param {Object} options - Options de pagination et de filtrage
 * @returns {Promise<Object>} Le personnel de l'unité
 */
async function getUnitePersonnel(uniteId, options = {}) {
  const { page = 1, limit = 10, typePersonnel } = options;
  
  console.log(`Fetching personnel for unite ID: ${uniteId}`);
  
  // Vérifier si l'unité existe
  const unite = await prisma.unite.findUnique({
    where: { id: uniteId }
  });
  
  if (!unite) {
    throw new Error(`L'unité avec l'ID ${uniteId} n'existe pas`);
  }
  
  // Construire les filtres
  const where = { uniteId };
  
  if (typePersonnel) {
    where.typePersonnel = typePersonnel;
  }
  
  // Compter le nombre total avec ces filtres
  const total = await prisma.personnel.count({ where });
  
  // Calculer l'offset pour la pagination
  const skip = (page - 1) * limit;
  
  // Récupérer les données paginées
  const personnel = await prisma.personnel.findMany({
    where,
    skip,
    take: limit,
    include: {
      militaire: {
        select: {
          id: true,
          matricule: true,
          grade: true
        }
      },
      professeur: {
        select: {
          id: true,
          specialite: true
        }
      },
      etudiant: {
        select: {
          id: true,
          matricule: true,
          anneeEtude: true
        }
      },
      employe: {
        select: {
          id: true,
          position: true
        }
      }
    },
    orderBy: {
      nom: 'asc'
    }
  });
  
  console.log(`Found ${personnel.length} personnel records for unite ID: ${uniteId}`);
  
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
 * Récupère les statistiques d'une unité
 * @param {string} uniteId - L'ID de l'unité
 * @returns {Promise<Object>} Les statistiques de l'unité
 */
async function getUniteStats(uniteId) {
  console.log(`Fetching statistics for unite ID: ${uniteId}`);
  
  // Vérifier si l'unité existe
  const unite = await prisma.unite.findUnique({
    where: { id: uniteId },
    include: {
      institut: true,
      dct: true,
      pc: true
    }
  });
  
  if (!unite) {
    throw new Error(`L'unité avec l'ID ${uniteId} n'existe pas`);
  }
  
  // Compter par type de personnel
  const totalPersonnel = await prisma.personnel.count({
    where: { uniteId }
  });
  
  const militaires = await prisma.personnel.count({
    where: { 
      uniteId,
      typePersonnel: 'MILITAIRE'
    }
  });
  
  const professeurs = await prisma.personnel.count({
    where: { 
      uniteId,
      typePersonnel: 'CIVIL_PROFESSEUR'
    }
  });
  
  const etudiants = await prisma.personnel.count({
    where: { 
      uniteId,
      typePersonnel: 'CIVIL_ETUDIANT'
    }
  });
  
  const employes = await prisma.personnel.count({
    where: { 
      uniteId,
      typePersonnel: 'CIVIL_EMPLOYE'
    }
  });
  
  // Récupérer la dernière situation quotidienne
  const derniereSituation = await prisma.dailySituation.findFirst({
    where: { uniteId },
    orderBy: { dateRapport: 'desc' }
  });
  
  const stats = {
    id: unite.id,
    nom: unite.nom,
    code: unite.code,
    type: unite.type,
    stats: {
      totalPersonnel,
      militaires,
      professeurs,
      etudiants,
      employes
    },
    derniereSituation
  };
  
  // Ajouter les détails spécifiques au type
  if (unite.type === 'INSTITUT' && unite.institut) {
    stats.institut = unite.institut;
  } else if (unite.type === 'DCT' && unite.dct) {
    stats.dct = unite.dct;
  } else if (unite.type === 'PC' && unite.pc) {
    stats.pc = unite.pc;
  }
  
  console.log(`Generated statistics for unite: ${unite.nom}`);
  return stats;
}

module.exports = {
  getAllUnites,
  getUniteById,
  getUniteByCode,
  getSousUnitesByUnite,
  getUnitePersonnel,
  getUniteStats,
  createUnite,
  updateUnite,
  deleteUnite
};