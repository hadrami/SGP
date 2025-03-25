// src/services/professeurService.js
const { PrismaClient } = require('@prisma/client');
const personnelService = require('./personnelService');

const prisma = new PrismaClient();

/**
 * Récupère tous les professeurs avec pagination
 * @param {Object} options - Options de filtrage et pagination
 * @returns {Promise<Object>} Liste des professeurs paginée
 */
async function getAllProfesseurs({ 
  page = 1, 
  limit = 10, 
  institutId = null, 
  specialite = null, 
  search = null 
}) {
  // Construire la requête de filtrage
  const where = {
    personnel: {
      typePersonnel: 'CIVIL_PROFESSEUR'
    }
  };
  
  if (institutId) {
    where.personnel.institutId = institutId;
  }
  
  if (specialite) {
    where.specialite = { contains: specialite, mode: 'insensitive' };
  }
  
  if (search) {
    where.OR = [
      { personnel: { nom: { contains: search, mode: 'insensitive' } } },
      { personnel: { prenom: { contains: search, mode: 'insensitive' } } },
      { specialite: { contains: search, mode: 'insensitive' } },
      { diplome: { contains: search, mode: 'insensitive' } }
    ];
  }
  
  // Calculer le nombre total avec ces filtres
  const total = await prisma.professeur.count({ where });
  
  // Calculer l'offset pour la pagination
  const skip = (page - 1) * limit;
  
  // Récupérer les données paginées
  const professeurs = await prisma.professeur.findMany({
    where,
    skip,
    take: limit,
    include: {
      personnel: {
        include: {
          institut: {
            select: {
              id: true,
              nom: true,
              code: true
            }
          }
        }
      },
      matieres: {
        select: {
          id: true,
          nom: true,
          code: true
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
    data: professeurs,
    pagination: {
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / limit)
    }
  };
}

/**
 * Récupère un professeur par son ID
 * @param {string} id - L'ID du professeur
 * @returns {Promise<Object>} Le professeur trouvé
 */
async function getProfesseurById(id) {
  return await prisma.professeur.findUnique({
    where: { id },
    include: {
      personnel: {
        include: {
          institut: true,
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
      },
      matieres: true,
      classes: {
        select: {
          id: true,
          nom: true,
          niveau: true,
          anneeScolaire: true
        }
      }
    }
  });
}

/**
 * Récupère un professeur par l'ID de son personnel
 * @param {string} personnelId - L'ID du personnel associé
 * @returns {Promise<Object>} Le professeur trouvé
 */
async function getProfesseurByPersonnelId(personnelId) {
  return await prisma.professeur.findUnique({
    where: { personnelId },
    include: {
      personnel: {
        include: {
          institut: true
        }
      },
      matieres: true,
      classes: true
    }
  });
}

/**
 * Crée un nouveau professeur
 * @param {Object} professeurData - Les données du professeur et du personnel associé
 * @returns {Promise<Object>} Le professeur créé
 */
async function createProfesseur(professeurData) {
  const {
    // Données du personnel
    nom,
    prenom,
    dateNaissance,
    lieuNaissance,
    telephone,
    email,
    nni,
    institutId,
    
    // Données spécifiques au professeur
    specialite,
    diplome,
    position,
    typeContrat
  } = professeurData;
  
  // Vérifier que le contrat est valide
  const contratValides = ['PERMANENT', 'CDI', 'CDD', 'VACATAIRE', 'PSV'];
  if (!contratValides.includes(typeContrat)) {
    throw new Error(`Le type de contrat ${typeContrat} n'est pas valide`);
  }
  
  // Créer d'abord le personnel de base
  const personnel = await personnelService.createPersonnel({
    typePersonnel: 'CIVIL_PROFESSEUR',
    nom,
    prenom,
    dateNaissance,
    lieuNaissance,
    telephone,
    email,
    nni,
    institutId
  });
  
  // Créer ensuite le professeur
  const professeur = await prisma.professeur.create({
    data: {
      specialite,
      diplome,
      position,
      typeContrat,
      personnelId: personnel.id
    },
    include: {
      personnel: {
        include: {
          institut: true
        }
      }
    }
  });
  
  return professeur;
}

/**
 * Met à jour un professeur existant
 * @param {string} id - L'ID du professeur à mettre à jour
 * @param {Object} professeurData - Les nouvelles données du professeur
 * @returns {Promise<Object>} Le professeur mis à jour
 */
async function updateProfesseur(id, professeurData) {
  const {
    // Données du personnel
    nom,
    prenom,
    dateNaissance,
    lieuNaissance,
    telephone,
    email,
    institutId,
    
    // Données spécifiques au professeur
    specialite,
    diplome,
    position,
    typeContrat
  } = professeurData;
  
  // Récupérer le professeur existant
  const professeur = await prisma.professeur.findUnique({
    where: { id },
    include: {
      personnel: true
    }
  });
  
  if (!professeur) {
    throw new Error(`Le professeur avec l'ID ${id} n'existe pas`);
  }
  
  // Mettre à jour le personnel d'abord si des données sont fournies
  if (nom || prenom || dateNaissance || lieuNaissance || telephone || email || institutId) {
    await personnelService.updatePersonnel(professeur.personnelId, {
      nom,
      prenom,
      dateNaissance,
      lieuNaissance,
      telephone,
      email,
      institutId
    });
  }
  
  // Préparer les données de mise à jour du professeur
  const updateData = {};
  
  if (specialite) updateData.specialite = specialite;
  if (diplome) updateData.diplome = diplome;
  if (position) updateData.position = position;
  
  // Vérifier que le contrat est valide si fourni
  if (typeContrat) {
    const contratValides = ['PERMANENT', 'CDI', 'CDD', 'VACATAIRE', 'PSV'];
    if (!contratValides.includes(typeContrat)) {
      throw new Error(`Le type de contrat ${typeContrat} n'est pas valide`);
    }
    updateData.typeContrat = typeContrat;
  }
  
  // Mettre à jour le professeur
  return await prisma.professeur.update({
    where: { id },
    data: updateData,
    include: {
      personnel: {
        include: {
          institut: true
        }
      }
    }
  });
}

/**
 * Ajoute une matière à un professeur
 * @param {string} professeurId - L'ID du professeur
 * @param {Object} matiereData - Les données de la matière
 * @returns {Promise<Object>} La matière créée
 */
async function ajouterMatiere(professeurId, matiereData) {
  const { nom, code } = matiereData;
  
  // Vérifier que le professeur existe
  const professeur = await prisma.professeur.findUnique({
    where: { id: professeurId }
  });
  
  if (!professeur) {
    throw new Error(`Le professeur avec l'ID ${professeurId} n'existe pas`);
  }
  
  // Créer la matière
  return await prisma.matiere.create({
    data: {
      nom,
      code,
      professeurId
    }
  });
}

/**
 * Associe un professeur à une classe
 * @param {string} professeurId - L'ID du professeur
 * @param {string} classeId - L'ID de la classe
 * @returns {Promise<Object>} Le professeur mis à jour avec ses classes
 */
async function associerClasse(professeurId, classeId) {
  // Vérifier que le professeur existe
  const professeur = await prisma.professeur.findUnique({
    where: { id: professeurId }
  });
  
  if (!professeur) {
    throw new Error(`Le professeur avec l'ID ${professeurId} n'existe pas`);
  }
  
  // Vérifier que la classe existe
  const classe = await prisma.classe.findUnique({
    where: { id: classeId }
  });
  
  if (!classe) {
    throw new Error(`La classe avec l'ID ${classeId} n'existe pas`);
  }
  
  // Associer le professeur à la classe
  await prisma.professeur.update({
    where: { id: professeurId },
    data: {
      classes: {
        connect: { id: classeId }
      }
    }
  });
  
  // Récupérer le professeur avec ses classes
  return await prisma.professeur.findUnique({
    where: { id: professeurId },
    include: {
      classes: true
    }
  });
}

/**
 * Dissocie un professeur d'une classe
 * @param {string} professeurId - L'ID du professeur
 * @param {string} classeId - L'ID de la classe
 * @returns {Promise<Object>} Le professeur mis à jour avec ses classes
 */
async function dissocierClasse(professeurId, classeId) {
  // Vérifier que le professeur existe
  const professeur = await prisma.professeur.findUnique({
    where: { id: professeurId }
  });
  
  if (!professeur) {
    throw new Error(`Le professeur avec l'ID ${professeurId} n'existe pas`);
  }
  
  // Vérifier que la classe existe
  const classe = await prisma.classe.findUnique({
    where: { id: classeId }
  });
  
  if (!classe) {
    throw new Error(`La classe avec l'ID ${classeId} n'existe pas`);
  }
  
  // Dissocier le professeur de la classe
  await prisma.professeur.update({
    where: { id: professeurId },
    data: {
      classes: {
        disconnect: { id: classeId }
      }
    }
  });
  
  // Récupérer le professeur avec ses classes
  return await prisma.professeur.findUnique({
    where: { id: professeurId },
    include: {
      classes: true
    }
  });
}

/**
 * Crée un cours pour une classe donné par un professeur
 * @param {string} matiereId - L'ID de la matière
 * @param {string} classeId - L'ID de la classe
 * @param {Object} coursData - Les données du cours
 * @returns {Promise<Object>} Le cours créé
 */
async function creerCours(matiereId, classeId, coursData) {
  const { typeCours, nbHeures } = coursData;
  
  // Vérifier que la matière existe
  const matiere = await prisma.matiere.findUnique({
    where: { id: matiereId },
    include: {
      professeur: true
    }
  });
  
  if (!matiere) {
    throw new Error(`La matière avec l'ID ${matiereId} n'existe pas`);
  }
  
  // Vérifier que la classe existe
  const classe = await prisma.classe.findUnique({
    where: { id: classeId }
  });
  
  if (!classe) {
    throw new Error(`La classe avec l'ID ${classeId} n'existe pas`);
  }
  
  // Vérifier que le type de cours est valide
  const typeCoursValides = ['COURS', 'TP', 'TD'];
  if (!typeCoursValides.includes(typeCours)) {
    throw new Error(`Le type de cours ${typeCours} n'est pas valide`);
  }
  
  // Créer le cours
  return await prisma.coursClasse.create({
    data: {
      typeCours,
      nbHeures: parseInt(nbHeures),
      matiereId,
      classeId
    },
    include: {
      matiere: {
        include: {
          professeur: {
            select: {
              personnel: {
                select: {
                  nom: true,
                  prenom: true
                }
              }
            }
          }
        }
      },
      classe: true
    }
  });
}

/**
 * Supprime un professeur (et le personnel associé)
 * @param {string} id - L'ID du professeur à supprimer
 * @returns {Promise<Object>} Le professeur supprimé
 */
async function deleteProfesseur(id) {
  // Récupérer le professeur pour obtenir l'ID du personnel
  const professeur = await prisma.professeur.findUnique({
    where: { id }
  });
  
  if (!professeur) {
    throw new Error(`Le professeur avec l'ID ${id} n'existe pas`);
  }
  
  // Supprimer les matières du professeur
  await prisma.matiere.deleteMany({
    where: { professeurId: id }
  });
  
  // Supprimer le professeur
  await prisma.professeur.delete({
    where: { id }
  });
  
  // Supprimer le personnel associé (et toutes les entités associées)
  return await personnelService.deletePersonnel(professeur.personnelId);
}

/**
 * Récupère les statistiques d'enseignement d'un professeur
 * @param {string} id - L'ID du professeur
 * @returns {Promise<Object>} Les statistiques du professeur
 */
async function getProfesseurStats(id) {
  // Vérifier que le professeur existe
  const professeur = await prisma.professeur.findUnique({
    where: { id },
    include: {
      personnel: true,
      matieres: {
        include: {
          coursClasses: {
            include: {
              classe: true
            }
          }
        }
      },
      classes: true
    }
  });
  
  if (!professeur) {
    throw new Error(`Le professeur avec l'ID ${id} n'existe pas`);
  }
  
  // Calculer le nombre total d'heures d'enseignement
  let totalHeures = 0;
  let coursParType = {
    COURS: 0,
    TP: 0,
    TD: 0
  };
  
  // Pour chaque matière, calculer les heures d'enseignement
  professeur.matieres.forEach(matiere => {
    matiere.coursClasses.forEach(cours => {
      totalHeures += cours.nbHeures;
      coursParType[cours.typeCours] += cours.nbHeures;
    });
  });
  
  return {
    professeurId: id,
    nom: professeur.personnel.nom,
    prenom: professeur.personnel.prenom,
    specialite: professeur.specialite,
    nbMatieres: professeur.matieres.length,
    nbClasses: professeur.classes.length,
    totalHeuresEnseignement: totalHeures,
    heuresParType: coursParType,
    statutContrat: professeur.typeContrat
  };
}

module.exports = {
  getAllProfesseurs,
  getProfesseurById,
  getProfesseurByPersonnelId,
  createProfesseur,
  updateProfesseur,
  ajouterMatiere,
  associerClasse,
  dissocierClasse,
  creerCours,
  deleteProfesseur,
  getProfesseurStats
};