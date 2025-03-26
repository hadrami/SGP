// src/services/specialiteService.js
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

/**
 * Récupère toutes les spécialités
 * @returns {Promise<Array>} La liste des spécialités
 */
async function getAllSpecialites() {
  return await prisma.specialite.findMany({
    include: {
      arme: {
        select: {
          id: true,
          nom: true
        }
      }
    }
  });
}

/**
 * Récupère une spécialité par son ID
 * @param {string} id - L'ID de la spécialité
 * @returns {Promise<Object>} La spécialité trouvée
 */
async function getSpecialiteById(id) {
  return await prisma.specialite.findUnique({
    where: { id },
    include: {
      arme: {
        select: {
          id: true,
          nom: true
        }
      }
    }
  });
}

/**
 * Crée une nouvelle spécialité
 * @param {Object} specialiteData - Les données de la spécialité à créer
 * @returns {Promise<Object>} La spécialité créée
 */
async function createSpecialite(specialiteData) {
  const { nom, description, armeId } = specialiteData;
  
  // Vérifier si l'arme existe
  const arme = await prisma.arme.findUnique({
    where: { id: armeId }
  });
  
  if (!arme) {
    throw new Error(`L'arme avec l'ID ${armeId} n'existe pas`);
  }
  
  // Vérifier s'il existe déjà une spécialité avec ce nom pour cette arme
  const existingSpecialite = await prisma.specialite.findFirst({
    where: {
      nom,
      armeId
    }
  });
  
  if (existingSpecialite) {
    throw new Error(`Une spécialité avec le nom ${nom} existe déjà pour cette arme`);
  }
  
  return await prisma.specialite.create({
    data: {
      nom,
      description,
      armeId
    },
    include: {
      arme: {
        select: {
          id: true,
          nom: true
        }
      }
    }
  });
}

/**
 * Met à jour une spécialité existante
 * @param {string} id - L'ID de la spécialité à mettre à jour
 * @param {Object} specialiteData - Les nouvelles données de la spécialité
 * @returns {Promise<Object>} La spécialité mise à jour
 */
async function updateSpecialite(id, specialiteData) {
  const { nom, description, armeId } = specialiteData;
  
  // Vérifier si la spécialité existe
  const specialite = await prisma.specialite.findUnique({
    where: { id }
  });
  
  if (!specialite) {
    throw new Error(`La spécialité avec l'ID ${id} n'existe pas`);
  }
  
  // Si on change l'arme, vérifier que la nouvelle arme existe
  if (armeId && armeId !== specialite.armeId) {
    const arme = await prisma.arme.findUnique({
      where: { id: armeId }
    });
    
    if (!arme) {
      throw new Error(`L'arme avec l'ID ${armeId} n'existe pas`);
    }
    
    // Vérifier s'il existe déjà une spécialité avec ce nom pour cette arme
    if (nom) {
      const existingSpecialite = await prisma.specialite.findFirst({
        where: {
          nom,
          armeId,
          NOT: {
            id
          }
        }
      });
      
      if (existingSpecialite) {
        throw new Error(`Une spécialité avec le nom ${nom} existe déjà pour cette arme`);
      }
    }
  }
  
  return await prisma.specialite.update({
    where: { id },
    data: {
      nom: nom || undefined,
      description: description !== undefined ? description : undefined,
      armeId: armeId || undefined
    },
    include: {
      arme: {
        select: {
          id: true,
          nom: true
        }
      }
    }
  });
}

/**
 * Supprime une spécialité
 * @param {string} id - L'ID de la spécialité à supprimer
 * @returns {Promise<Object>} La spécialité supprimée
 */
async function deleteSpecialite(id) {
  // Vérifier si la spécialité existe
  const specialite = await prisma.specialite.findUnique({
    where: { id },
    include: {
      militaires: true
    }
  });
  
  if (!specialite) {
    throw new Error(`La spécialité avec l'ID ${id} n'existe pas`);
  }
  
  // Vérifier si des militaires sont associés à cette spécialité
  if (specialite.militaires.length > 0) {
    throw new Error(`Impossible de supprimer la spécialité car elle est assignée à ${specialite.militaires.length} militaires`);
  }
  
  return await prisma.specialite.delete({
    where: { id }
  });
}

module.exports = {
  getAllSpecialites,
  getSpecialiteById,
  createSpecialite,
  updateSpecialite,
  deleteSpecialite
};