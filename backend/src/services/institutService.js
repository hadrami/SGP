// src/services/institutService.js
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

/**
 * Récupère tous les instituts
 * @returns {Promise<Array>} La liste des instituts
 */
async function getAllInstituts() {
  return await prisma.institut.findMany({
    include: {
      directeur: {
        select: {
          id: true,
          name: true,
          identifier: true
        }
      }
    }
  });
}

/**
 * Récupère un institut par son ID
 * @param {string} id - L'ID de l'institut
 * @returns {Promise<Object>} L'institut trouvé
 */
async function getInstitutById(id) {
  return await prisma.institut.findUnique({
    where: { id },
    include: {
      directeur: {
        select: {
          id: true,
          name: true,
          identifier: true
        }
      },
      personnels: {
        select: {
          id: true,
          nom: true,
          prenom: true,
          typePersonnel: true
        },
        take: 10 // Limiter pour éviter de surcharger la réponse
      }
    }
  });
}

/**
 * Récupère un institut par son code
 * @param {string} code - Le code de l'institut
 * @returns {Promise<Object>} L'institut trouvé
 */
async function getInstitutByCode(code) {
  return await prisma.institut.findUnique({
    where: { code },
    include: {
      directeur: {
        select: {
          id: true,
          name: true,
          identifier: true
        }
      }
    }
  });
}

/**
 * Crée un nouvel institut
 * @param {Object} institutData - Les données de l'institut à créer
 * @returns {Promise<Object>} L'institut créé
 */
async function createInstitut(institutData) {
  const { nom, code, emplacement, description, anneeEtude, directeurId } = institutData;
  
  // Vérifier si un institut avec ce code existe déjà
  const existingInstitut = await prisma.institut.findUnique({
    where: { code }
  });
  
  if (existingInstitut) {
    throw new Error(`Un institut avec le code ${code} existe déjà`);
  }
  
  return await prisma.institut.create({
    data: {
      nom,
      code,
      emplacement,
      description,
      anneeEtude: anneeEtude ? parseInt(anneeEtude) : null,
      directeurId: directeurId ? parseInt(directeurId) : null
    },
    include: {
      directeur: {
        select: {
          id: true,
          name: true,
          identifier: true
        }
      }
    }
  });
}

/**
 * Met à jour un institut existant
 * @param {string} id - L'ID de l'institut à mettre à jour
 * @param {Object} institutData - Les nouvelles données de l'institut
 * @returns {Promise<Object>} L'institut mis à jour
 */
async function updateInstitut(id, institutData) {
  const { nom, emplacement, description, anneeEtude, directeurId } = institutData;
  
  // Note: Nous ne permettons pas de changer le code car c'est un identifiant unique
  return await prisma.institut.update({
    where: { id },
    data: {
      nom,
      emplacement,
      description,
      anneeEtude: anneeEtude ? parseInt(anneeEtude) : null,
      directeurId: directeurId ? parseInt(directeurId) : null
    },
    include: {
      directeur: {
        select: {
          id: true,
          name: true,
          identifier: true
        }
      }
    }
  });
}

/**
 * Supprime un institut
 * @param {string} id - L'ID de l'institut à supprimer
 * @returns {Promise<Object>} L'institut supprimé
 */
async function deleteInstitut(id) {
  // Vérifier s'il y a du personnel attaché à cet institut
  const personnelCount = await prisma.personnel.count({
    where: { institutId: id }
  });
  
  if (personnelCount > 0) {
    throw new Error(`Impossible de supprimer l'institut car ${personnelCount} personnels y sont rattachés`);
  }
  
  return await prisma.institut.delete({
    where: { id }
  });
}

/**
 * Récupère les statistiques d'un institut
 * @param {string} id - L'ID de l'institut
 * @returns {Promise<Object>} Les statistiques de l'institut
 */
async function getInstitutStats(id) {
  // Vérifier si l'institut existe
  const institut = await prisma.institut.findUnique({
    where: { id }
  });
  
  if (!institut) {
    throw new Error(`L'institut avec l'ID ${id} n'existe pas`);
  }
  
  // Compter les différents types de personnel
  const militairesCount = await prisma.personnel.count({
    where: { 
      institutId: id,
      typePersonnel: 'MILITAIRE'
    }
  });
  
  const professeursCount = await prisma.personnel.count({
    where: { 
      institutId: id,
      typePersonnel: 'CIVIL_PROFESSEUR'
    }
  });
  
  const etudiantsCount = await prisma.personnel.count({
    where: { 
      institutId: id,
      typePersonnel: 'CIVIL_ETUDIANT'
    }
  });
  
  const employesCount = await prisma.personnel.count({
    where: { 
      institutId: id,
      typePersonnel: 'CIVIL_EMPLOYE'
    }
  });
  
  // Récupérer la dernière situation quotidienne
  const lastSituation = await prisma.dailySituation.findFirst({
    where: { institutId: id },
    orderBy: { dateRapport: 'desc' }
  });
  
  return {
    id: institut.id,
    nom: institut.nom,
    code: institut.code,
    stats: {
      totalPersonnel: militairesCount + professeursCount + etudiantsCount + employesCount,
      militaires: militairesCount,
      professeurs: professeursCount,
      etudiants: etudiantsCount,
      employes: employesCount
    },
    derniereSituation: lastSituation || null
  };
}

module.exports = {
  getAllInstituts,
  getInstitutById,
  getInstitutByCode,
  createInstitut,
  updateInstitut,
  deleteInstitut,
  getInstitutStats
};