// src/services/fonctionService.js
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

/**
 * Récupère toutes les fonctions
 * @returns {Promise<Array>} La liste des fonctions
 */
async function getAllFonctions() {
  return await prisma.fonction.findMany();
}

/**
 * Récupère une fonction par son ID
 * @param {string} id - L'ID de la fonction
 * @returns {Promise<Object>} La fonction trouvée
 */
async function getFonctionById(id) {
  return await prisma.fonction.findUnique({
    where: { id }
  });
}

/**
 * Crée une nouvelle fonction
 * @param {Object} fonctionData - Les données de la fonction à créer
 * @returns {Promise<Object>} La fonction créée
 */
async function createFonction(fonctionData) {
  const { titre, description } = fonctionData;
  
  // Vérifier s'il existe déjà une fonction avec ce titre
  const existingFonction = await prisma.fonction.findFirst({
    where: { titre }
  });
  
  if (existingFonction) {
    throw new Error(`Une fonction avec le titre ${titre} existe déjà`);
  }
  
  return await prisma.fonction.create({
    data: {
      titre,
      description
    }
  });
}

/**
 * Met à jour une fonction existante
 * @param {string} id - L'ID de la fonction à mettre à jour
 * @param {Object} fonctionData - Les nouvelles données de la fonction
 * @returns {Promise<Object>} La fonction mise à jour
 */
async function updateFonction(id, fonctionData) {
  const { titre, description } = fonctionData;
  
  // Vérifier si la fonction existe
  const fonction = await prisma.fonction.findUnique({
    where: { id }
  });
  
  if (!fonction) {
    throw new Error(`La fonction avec l'ID ${id} n'existe pas`);
  }
  
  // Vérifier si une autre fonction a déjà ce titre
  if (titre && titre !== fonction.titre) {
    const existingFonction = await prisma.fonction.findFirst({
      where: {
        titre,
        NOT: {
          id
        }
      }
    });
    
    if (existingFonction) {
      throw new Error(`Une fonction avec le titre ${titre} existe déjà`);
    }
  }
  
  return await prisma.fonction.update({
    where: { id },
    data: {
      titre: titre || undefined,
      description: description !== undefined ? description : undefined
    }
  });
}

/**
 * Supprime une fonction
 * @param {string} id - L'ID de la fonction à supprimer
 * @returns {Promise<Object>} La fonction supprimée
 */
async function deleteFonction(id) {
  // Vérifier si la fonction existe
  const fonction = await prisma.fonction.findUnique({
    where: { id },
    include: {
      militaires: true
    }
  });
  
  if (!fonction) {
    throw new Error(`La fonction avec l'ID ${id} n'existe pas`);
  }
  
  // Vérifier si des militaires sont associés à cette fonction
  if (fonction.militaires.length > 0) {
    throw new Error(`Impossible de supprimer la fonction car elle est assignée à ${fonction.militaires.length} militaires`);
  }
  
  return await prisma.fonction.delete({
    where: { id }
  });
}

module.exports = {
  getAllFonctions,
  getFonctionById,
  createFonction,
  updateFonction,
  deleteFonction
};