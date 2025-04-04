// src/services/sousUniteService.js
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

/**
 * Récupère toutes les sous-unités
 * @returns {Promise<Array>} La liste des sous-unités
 */
async function getAllSousUnites() {
  return await prisma.sousUnite.findMany({
    include: {
      unite: {
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
 * Récupère une sous-unité par son ID
 * @param {string} id - L'ID de la sous-unité
 * @returns {Promise<Object>} La sous-unité trouvée
 */
async function getSousUniteById(id) {
  return await prisma.sousUnite.findUnique({
    where: { id },
    include: {
      unite: {
        select: {
          id: true,
          nom: true,
          code: true,
          institutId: true,
          institut: {
            select: {
              id: true,
              nom: true,
              code: true
            }
          }
        }
      }
    }
  });
}

/**
 * Récupère une sous-unité par son code
 * @param {string} code - Le code de la sous-unité
 * @returns {Promise<Object>} La sous-unité trouvée
 */
async function getSousUniteByCode(code) {
  return await prisma.sousUnite.findUnique({
    where: { code },
    include: {
      unite: {
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
 * Récupère les militaires d'une sous-unité
 * @param {string} sousUniteId - L'ID de la sous-unité
 * @param {number} page - Numéro de page pour la pagination
 * @param {number} limit - Nombre d'éléments par page
 * @returns {Promise<Object>} Données paginées des militaires de la sous-unité
 */
async function getMilitairesBySousUnite(sousUniteId, page = 1, limit = 10) {
  // Vérifier si la sous-unité existe
  const sousUnite = await prisma.sousUnite.findUnique({
    where: { id: sousUniteId }
  });
  
  if (!sousUnite) {
    throw new Error(`La sous-unité avec l'ID ${sousUniteId} n'existe pas`);
  }
  
  // Calculer l'offset pour la pagination
  const skip = (page - 1) * limit;
  
  // Compter le nombre total de militaires dans cette sous-unité
  const total = await prisma.militaire.count({
    where: { sousUniteId }
  });
  
  // Récupérer les militaires paginés
  const militaires = await prisma.militaire.findMany({
    where: { sousUniteId },
    skip,
    take: Number(limit),
    include: {
      personnel: {
        select: {
          nom: true,
          prenom: true
        }
      },
      fonction: {
        select: {
          id: true,
          titre: true
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
    data: militaires,
    pagination: {
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / limit)
    }
  };
}

/**
 * Crée une nouvelle sous-unité
 * @param {Object} sousUniteData - Les données de la sous-unité à créer
 * @returns {Promise<Object>} La sous-unité créée
 */
async function createSousUnite(sousUniteData) {
  const { nom, code, description, uniteId } = sousUniteData;
  
  // Vérifier si une sous-unité avec ce code existe déjà
  const existingSousUnite = await prisma.sousUnite.findUnique({
    where: { code }
  });
  
  if (existingSousUnite) {
    throw new Error(`Une sous-unité avec le code ${code} existe déjà`);
  }
  
  // Vérifier si l'unité existe
  const unite = await prisma.unite.findUnique({
    where: { id: uniteId }
  });
  
  if (!unite) {
    throw new Error(`L'unité avec l'ID ${uniteId} n'existe pas`);
  }
  
  return await prisma.sousUnite.create({
    data: {
      nom,
      code,
      description,
      uniteId
    },
    include: {
      unite: {
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
 * Met à jour une sous-unité existante
 * @param {string} id - L'ID de la sous-unité à mettre à jour
 * @param {Object} sousUniteData - Les nouvelles données de la sous-unité
 * @returns {Promise<Object>} La sous-unité mise à jour
 */
async function updateSousUnite(id, sousUniteData) {
  const { nom, description, uniteId } = sousUniteData;
  
  // Vérifier si la sous-unité existe
  const sousUnite = await prisma.sousUnite.findUnique({
    where: { id }
  });
  
  if (!sousUnite) {
    throw new Error(`La sous-unité avec l'ID ${id} n'existe pas`);
  }
  
  // Vérifier si l'unité existe (si fournie)
  if (uniteId && uniteId !== sousUnite.uniteId) {
    const unite = await prisma.unite.findUnique({
      where: { id: uniteId }
    });
    
    if (!unite) {
      throw new Error(`L'unité avec l'ID ${uniteId} n'existe pas`);
    }
  }
  
  return await prisma.sousUnite.update({
    where: { id },
    data: {
      nom: nom || undefined,
      description: description !== undefined ? description : undefined,
      uniteId: uniteId || undefined
    },
    include: {
      unite: {
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
 * Supprime une sous-unité
 * @param {string} id - L'ID de la sous-unité à supprimer
 * @returns {Promise<Object>} La sous-unité supprimée
 */
async function deleteSousUnite(id) {
  // Vérifier si la sous-unité existe
  const sousUnite = await prisma.sousUnite.findUnique({
    where: { id },
    include: {
      militaires: true
    }
  });
  
  if (!sousUnite) {
    throw new Error(`La sous-unité avec l'ID ${id} n'existe pas`);
  }
  
  // Vérifier s'il y a des militaires liés à cette sous-unité
  if (sousUnite.militaires.length > 0) {
    throw new Error(`Impossible de supprimer la sous-unité car elle possède ${sousUnite.militaires.length} militaires`);
  }
  
  return await prisma.sousUnite.delete({
    where: { id }
  });
}

module.exports = {
  getAllSousUnites,
  getSousUniteById,
  getSousUniteByCode,
  getMilitairesBySousUnite,
  createSousUnite,
  updateSousUnite,
  deleteSousUnite
};