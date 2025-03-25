// src/services/documentService.js
const { PrismaClient } = require('@prisma/client');
const path = require('path');
const fs = require('fs');
const util = require('util');
const pipeline = util.promisify(require('stream').pipeline);

const prisma = new PrismaClient();

// Fonction pour créer le répertoire de stockage si nécessaire
function ensureDirectoryExists(directory) {
  if (!fs.existsSync(directory)) {
    fs.mkdirSync(directory, { recursive: true });
  }
  return directory;
}

/**
 * Récupère tous les documents avec filtrage optionnel
 * @param {Object} options - Options de filtrage
 * @returns {Promise<Array>} Liste des documents
 */
async function getAllDocuments({ typeDocument = null, personnelId = null, page = 1, limit = 20 }) {
  const where = {};
  
  if (typeDocument) {
    where.typeDocument = typeDocument;
  }
  
  if (personnelId) {
    where.personnelId = personnelId;
  }
  
  const total = await prisma.document.count({ where });
  const skip = (page - 1) * limit;
  
  const documents = await prisma.document.findMany({
    where,
    skip,
    take: Number(limit),
    include: {
      personnel: {
        select: {
          id: true,
          nom: true,
          prenom: true,
          nni: true,
          typePersonnel: true
        }
      },
      uploadeur: {
        select: {
          id: true,
          name: true
        }
      }
    },
    orderBy: {
      dateUpload: 'desc'
    }
  });
  
  return {
    data: documents,
    pagination: {
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / limit)
    }
  };
}

/**
 * Récupère un document par son ID
 * @param {string} id - L'ID du document
 * @returns {Promise<Object>} Le document trouvé
 */
async function getDocumentById(id) {
  return await prisma.document.findUnique({
    where: { id },
    include: {
      personnel: {
        select: {
          id: true,
          nom: true,
          prenom: true,
          nni: true,
          typePersonnel: true,
          institut: {
            select: {
              id: true,
              nom: true,
              code: true
            }
          }
        }
      },
      uploadeur: {
        select: {
          id: true,
          name: true
        }
      }
    }
  });
}

/**
 * Récupère tous les documents d'un personnel
 * @param {string} personnelId - L'ID du personnel
 * @returns {Promise<Array>} Les documents du personnel
 */
async function getDocumentsByPersonnel(personnelId) {
  return await prisma.document.findMany({
    where: { personnelId },
    include: {
      uploadeur: {
        select: {
          id: true,
          name: true
        }
      }
    },
    orderBy: {
      dateUpload: 'desc'
    }
  });
}

/**
 * Télécharge un nouveau document
 * @param {Object} data - Les données du document
 * @param {Object} file - Le fichier à télécharger
 * @param {number} userId - L'ID de l'utilisateur qui télécharge
 * @returns {Promise<Object>} Le document créé
 */
async function uploadDocument(data, file, userId) {
  const { typeDocument, description, personnelId } = data;
  
  // Vérifier que le personnel existe
  const personnel = await prisma.personnel.findUnique({
    where: { id: personnelId }
  });
  
  if (!personnel) {
    throw new Error(`Le personnel avec l'ID ${personnelId} n'existe pas`);
  }
  
  // Créer le répertoire de stockage par type
  const typeDir = typeDocument.toLowerCase();
  const uploadsDir = path.join(__dirname, '..', 'uploads', 'documents', typeDir);
  ensureDirectoryExists(uploadsDir);
  
  // Générer un nom de fichier unique
  const fileExtension = path.extname(file.filename);
  const uniqueFilename = `${personnel.nni}_${Date.now()}${fileExtension}`;
  const filePath = path.join(uploadsDir, uniqueFilename);
  
  // Chemin relatif pour la base de données
  const relativePath = `/uploads/documents/${typeDir}/${uniqueFilename}`;
  
  try {
    // Enregistrer le fichier sur le disque
    await pipeline(file.file, fs.createWriteStream(filePath));
    
    // Enregistrer les métadonnées dans la base de données
    return await prisma.document.create({
      data: {
        typeDocument,
        nomFichier: file.filename,
        cheminFichier: relativePath,
        description,
        personnelId,
        uploadePar: userId
      },
      include: {
        personnel: {
          select: {
            id: true,
            nom: true,
            prenom: true
          }
        },
        uploadeur: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });
  } catch (error) {
    // En cas d'erreur, supprimer le fichier s'il a été créé
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    throw error;
  }
}

/**
 * Met à jour les informations d'un document
 * @param {string} id - L'ID du document
 * @param {Object} data - Les nouvelles données du document
 * @returns {Promise<Object>} Le document mis à jour
 */
async function updateDocument(id, data) {
  const { typeDocument, description } = data;
  
  // Vérifier que le document existe
  const document = await prisma.document.findUnique({
    where: { id }
  });
  
  if (!document) {
    throw new Error(`Le document avec l'ID ${id} n'existe pas`);
  }
  
  // Si le type de document a changé, déplacer le fichier vers le nouveau répertoire
  let cheminFichier = document.cheminFichier;
  
  if (typeDocument && typeDocument !== document.typeDocument) {
    const oldFilePath = path.join(__dirname, '..', document.cheminFichier);
    const fileName = path.basename(document.cheminFichier);
    const newTypeDir = typeDocument.toLowerCase();
    const newUploadsDir = path.join(__dirname, '..', 'uploads', 'documents', newTypeDir);
    
    // Créer le nouveau répertoire si nécessaire
    ensureDirectoryExists(newUploadsDir);
    
    const newFilePath = path.join(newUploadsDir, fileName);
    const newRelativePath = `/uploads/documents/${newTypeDir}/${fileName}`;
    
    // Déplacer le fichier
    if (fs.existsSync(oldFilePath)) {
      fs.renameSync(oldFilePath, newFilePath);
      cheminFichier = newRelativePath;
    }
  }
  
  // Mettre à jour le document dans la base de données
  return await prisma.document.update({
    where: { id },
    data: {
      typeDocument,
      description,
      cheminFichier
    }
  });
}

/**
 * Supprime un document
 * @param {string} id - L'ID du document à supprimer
 * @returns {Promise<Object>} Le document supprimé
 */
async function deleteDocument(id) {
  // Vérifier que le document existe
  const document = await prisma.document.findUnique({
    where: { id }
  });
  
  if (!document) {
    throw new Error(`Le document avec l'ID ${id} n'existe pas`);
  }
  
  // Supprimer le fichier du stockage
  const filePath = path.join(__dirname, '..', document.cheminFichier);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
  
  // Supprimer l'entrée de la base de données
  return await prisma.document.delete({
    where: { id }
  });
}

/**
 * Récupère les statistiques sur les documents
 * @returns {Promise<Object>} Les statistiques des documents
 */
async function getDocumentStats() {
  // Compter les documents par type
  const countByType = await prisma.document.groupBy({
    by: ['typeDocument'],
    _count: {
      id: true
    }
  });
  
  // Récents uploads (30 derniers jours)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  const recentUploads = await prisma.document.count({
    where: {
      dateUpload: {
        gte: thirtyDaysAgo
      }
    }
  });
  
  // Documents par institut
  const documentsByInstitut = await prisma.$queryRaw`
    SELECT i.nom, i.code, COUNT(d.id) as count
    FROM "instituts" i
    JOIN "personnels" p ON p."institutId" = i.id
    JOIN "documents" d ON d."personnelId" = p.id
    GROUP BY i.id
    ORDER BY count DESC
  `;
  
  return {
    total: await prisma.document.count(),
    byType: countByType.map(item => ({
      type: item.typeDocument,
      count: item._count.id
    })),
    recentUploads,
    byInstitut: documentsByInstitut
  };
}

module.exports = {
  getAllDocuments,
  getDocumentById,
  getDocumentsByPersonnel,
  uploadDocument,
  updateDocument,
  deleteDocument,
  getDocumentStats
};