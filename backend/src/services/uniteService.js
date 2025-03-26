// src/services/uniteService.js
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

/**
 * Récupère toutes les unités
 * @returns {Promise<Array>} La liste des unités
 */
async function getAllUnites() {
  return await prisma.unite.findMany({
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
 * Récupère une unité par son ID
 * @param {string} id - L'ID de l'unité
 * @returns {Promise<Object>} L'unité trouvée
 */
async function getUniteById(id) {
  return await prisma.unite.findUnique({
    where: { id },
    include: {
      institut: {
        select: {
          id: true,
          nom: true,
          code: true
        }
      },
      sousUnites: true
    }
  });
}

/**
 * Récupère une unité par son code
 * @param {string} code - Le code de l'unité
 * @returns {Promise<Object>} L'unité trouvée
 */
async function getUniteByCode(code) {
  return await prisma.unite.findUnique({
    where: { code },
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
 * Récupère les sous-unités d'une unité
 * @param {string} uniteId - L'ID de l'unité
 * @returns {Promise<Array>} La liste des sous-unités de l'unité
 */
async function getSousUnitesByUnite(uniteId) {
  // Vérifier si l'unité existe
  const unite = await prisma.unite.findUnique({
    where: { id: uniteId }
  });
  
  if (!unite) {
    throw new Error(`L'unité avec l'ID ${uniteId} n'existe pas`);
  }
  
  return await prisma.sousUnite.findMany({
    where: { uniteId }
  });
}

/**
 * Crée une nouvelle unité
 * @param {Object} uniteData - Les données de l'unité à créer
 * @returns {Promise<Object>} L'unité créée
 */
async function createUnite(uniteData) {
  const { nom, code, description, institutId } = uniteData;
  
  // Vérifier si une unité avec ce code existe déjà
  const existingUnite = await prisma.unite.findUnique({
    where: { code }
  });
  
  if (existingUnite) {
    throw new Error(`Une unité avec le code ${code} existe déjà`);
  }
  
  // Vérifier si l'institut existe (s'il est fourni)
  if (institutId) {
    const institut = await prisma.institut.findUnique({
      where: { id: institutId }
    });
    
    if (!institut) {
      throw new Error(`L'institut avec l'ID ${institutId} n'existe pas`);
    }
  }
  
  return await prisma.unite.create({
    data: {
      nom,
      code,
      description,
      institutId
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
 * Met à jour une unité existante
 * @param {string} id - L'ID de l'unité à mettre à jour
 * @param {Object} uniteData - Les nouvelles données de l'unité
 * @returns {Promise<Object>} L'unité mise à jour
 */
async function updateUnite(id, uniteData) {
  const { nom, description, institutId } = uniteData;
  
  // Vérifier si l'unité existe
  const unite = await prisma.unite.findUnique({
    where: { id }
  });
  
  if (!unite) {
    throw new Error(`L'unité avec l'ID ${id} n'existe pas`);
  }
  
  // Vérifier si l'institut existe (s'il est fourni)
  if (institutId) {
    const institut = await prisma.institut.findUnique({
      where: { id: institutId }
    });
    
    if (!institut) {
      throw new Error(`L'institut avec l'ID ${institutId} n'existe pas`);
    }
  }
  
  return await prisma.unite.update({
    where: { id },
    data: {
      nom: nom || undefined,
      description: description !== undefined ? description : undefined,
      institutId: institutId !== undefined ? institutId : undefined
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
 * Supprime une unité
 * @param {string} id - L'ID de l'unité à supprimer
 * @returns {Promise<Object>} L'unité supprimée
 */
async function deleteUnite(id) {
  // Vérifier si l'unité existe
  const unite = await prisma.unite.findUnique({
    where: { id },
    include: {
      sousUnites: true
    }
  });
  
  if (!unite) {
    throw new Error(`L'unité avec l'ID ${id} n'existe pas`);
  }
  
  // Vérifier s'il y a des sous-unités liées à cette unité
  if (unite.sousUnites.length > 0) {
    throw new Error(`Impossible de supprimer l'unité car elle possède ${unite.sousUnites.length} sous-unités`);
  }
  
  return await prisma.unite.delete({
    where: { id }
  });
}

module.exports = {
  getAllUnites,
  getUniteById,
  getUniteByCode,
  getSousUnitesByUnite,
  createUnite,
  updateUnite,
  deleteUnite
};