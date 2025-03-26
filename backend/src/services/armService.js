// src/services/armeService.js
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

/**
 * Récupère toutes les armes
 * @returns {Promise<Array>} La liste des armes
 */
async function getAllArmes() {
  return await prisma.arme.findMany();
}

/**
 * Récupère une arme par son ID
 * @param {string} id - L'ID de l'arme
 * @returns {Promise<Object>} L'arme trouvée
 */
async function getArmeById(id) {
  return await prisma.arme.findUnique({
    where: { id }
  });
}

/**
 * Récupère les spécialités d'une arme
 * @param {string} armeId - L'ID de l'arme
 * @returns {Promise<Array>} La liste des spécialités de l'arme
 */
async function getSpecialitesByArme(armeId) {
  // Vérifier si l'arme existe
  const arme = await prisma.arme.findUnique({
    where: { id: armeId }
  });
  
  if (!arme) {
    throw new Error(`L'arme avec l'ID ${armeId} n'existe pas`);
  }
  
  return await prisma.specialite.findMany({
    where: { armeId }
  });
}

/**
 * Crée une nouvelle arme
 * @param {Object} armeData - Les données de l'arme à créer
 * @returns {Promise<Object>} L'arme créée
 */
async function createArme(armeData) {
  const { nom, description } = armeData;
  
  // Vérifier si une arme avec ce nom existe déjà
  const existingArme = await prisma.arme.findUnique({
    where: { nom }
  });
  
  if (existingArme) {
    throw new Error(`Une arme avec le nom ${nom} existe déjà`);
  }
  
  return await prisma.arme.create({
    data: {
      nom,
      description
    }
  });
}

/**
 * Met à jour une arme existante
 * @param {string} id - L'ID de l'arme à mettre à jour
 * @param {Object} armeData - Les nouvelles données de l'arme
 * @returns {Promise<Object>} L'arme mise à jour
 */
async function updateArme(id, armeData) {
  const { nom, description } = armeData;
  
  // Vérifier si l'arme existe
  const arme = await prisma.arme.findUnique({
    where: { id }
  });
  
  if (!arme) {
    throw new Error(`L'arme avec l'ID ${id} n'existe pas`);
  }
  
  // Vérifier si une autre arme a déjà ce nom
  if (nom && nom !== arme.nom) {
    const existingArme = await prisma.arme.findUnique({
      where: { nom }
    });
    
    if (existingArme) {
      throw new Error(`Une arme avec le nom ${nom} existe déjà`);
    }
  }
  
  return await prisma.arme.update({
    where: { id },
    data: {
      nom: nom || undefined,
      description: description !== undefined ? description : undefined
    }
  });
}

/**
 * Supprime une arme
 * @param {string} id - L'ID de l'arme à supprimer
 * @returns {Promise<Object>} L'arme supprimée
 */
async function deleteArme(id) {
  // Vérifier si l'arme existe
  const arme = await prisma.arme.findUnique({
    where: { id },
    include: {
      specialites: true,
      militaires: true
    }
  });
  
  if (!arme) {
    throw new Error(`L'arme avec l'ID ${id} n'existe pas`);
  }
  
  // Vérifier s'il y a des spécialités ou des militaires liés à cette arme
  if (arme.specialites.length > 0) {
    throw new Error(`Impossible de supprimer l'arme car elle possède ${arme.specialites.length} spécialités`);
  }
  
  if (arme.militaires.length > 0) {
    throw new Error(`Impossible de supprimer l'arme car elle est assignée à ${arme.militaires.length} militaires`);
  }
  
  return await prisma.arme.delete({
    where: { id }
  });
}

module.exports = {
  getAllArmes,
  getArmeById,
  getSpecialitesByArme,
  createArme,
  updateArme,
  deleteArme
};