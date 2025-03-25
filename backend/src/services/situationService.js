// src/services/situationService.js
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

/**
 * Récupère toutes les situations quotidiennes avec pagination et filtrage
 * @param {Object} options - Options de filtrage et pagination
 * @returns {Promise<Object>} Liste des situations paginée
 */
async function getAllSituations({ page = 1, limit = 10, institutId = null, dateDebut = null, dateFin = null }) {
  // Construire la requête de filtrage
  const where = {};
  
  if (institutId) {
    where.institutId = institutId;
  }
  
  // Filtrage par période de date
  if (dateDebut || dateFin) {
    where.dateRapport = {};
    
    if (dateDebut) {
      where.dateRapport.gte = new Date(dateDebut);
    }
    
    if (dateFin) {
      where.dateRapport.lte = new Date(dateFin);
    }
  }
  
  // Calculer le nombre total avec ces filtres
  const total = await prisma.dailySituation.count({ where });
  
  // Calculer l'offset pour la pagination
  const skip = (page - 1) * limit;
  
  // Récupérer les données paginées
  const situations = await prisma.dailySituation.findMany({
    where,
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
      createur: {
        select: {
          id: true,
          name: true,
          identifier: true
        }
      }
    },
    orderBy: {
      dateRapport: 'desc'
    }
  });
  
  return {
    data: situations,
    pagination: {
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / limit)
    }
  };
}

/**
 * Récupère une situation quotidienne par son ID
 * @param {string} id - L'ID de la situation
 * @returns {Promise<Object>} La situation trouvée
 */
async function getSituationById(id) {
  return await prisma.dailySituation.findUnique({
    where: { id },
    include: {
      institut: {
        select: {
          id: true,
          nom: true,
          code: true
        }
      },
      createur: {
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
 * Crée une nouvelle situation quotidienne
 * @param {Object} situationData - Les données de la situation
 * @param {number} userId - L'ID de l'utilisateur créant la situation
 * @returns {Promise<Object>} La situation créée
 */
async function createSituation(situationData, userId) {
  const {
    dateRapport,
    militairesPresents,
    civilsPresents,
    professeursPresents,
    etudiantsPresents,
    remarques,
    institutId
  } = situationData;
  
  // Vérifier que l'institut existe
  const institut = await prisma.institut.findUnique({
    where: { id: institutId }
  });
  
  if (!institut) {
    throw new Error(`L'institut avec l'ID ${institutId} n'existe pas`);
  }
  
  // Vérifier si une situation existe déjà pour cette date et cet institut
  const existingSituation = await prisma.dailySituation.findFirst({
    where: {
      institutId,
      dateRapport: {
        gte: new Date(new Date(dateRapport).setHours(0, 0, 0, 0)),
        lt: new Date(new Date(dateRapport).setHours(23, 59, 59, 999))
      }
    }
  });
  
  if (existingSituation) {
    throw new Error(`Une situation existe déjà pour cette date et cet institut`);
  }
  
  return await prisma.dailySituation.create({
    data: {
      dateRapport: dateRapport ? new Date(dateRapport) : new Date(),
      militairesPresents: parseInt(militairesPresents || 0),
      civilsPresents: parseInt(civilsPresents || 0),
      professeursPresents: parseInt(professeursPresents || 0),
      etudiantsPresents: parseInt(etudiantsPresents || 0),
      remarques,
      institutId,
      creePar: userId
    },
    include: {
      institut: {
        select: {
          id: true,
          nom: true,
          code: true
        }
      },
      createur: {
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
 * Met à jour une situation quotidienne existante
 * @param {string} id - L'ID de la situation à mettre à jour
 * @param {Object} situationData - Les nouvelles données de la situation
 * @returns {Promise<Object>} La situation mise à jour
 */
async function updateSituation(id, situationData) {
  const {
    militairesPresents,
    civilsPresents,
    professeursPresents,
    etudiantsPresents,
    remarques
  } = situationData;
  
  // Vérifier que la situation existe
  const situation = await prisma.dailySituation.findUnique({
    where: { id }
  });
  
  if (!situation) {
    throw new Error(`La situation avec l'ID ${id} n'existe pas`);
  }
  
  // Mettre à jour la situation
  return await prisma.dailySituation.update({
    where: { id },
    data: {
      militairesPresents: militairesPresents !== undefined ? parseInt(militairesPresents) : situation.militairesPresents,
      civilsPresents: civilsPresents !== undefined ? parseInt(civilsPresents) : situation.civilsPresents,
      professeursPresents: professeursPresents !== undefined ? parseInt(professeursPresents) : situation.professeursPresents,
      etudiantsPresents: etudiantsPresents !== undefined ? parseInt(etudiantsPresents) : situation.etudiantsPresents,
      remarques: remarques !== undefined ? remarques : situation.remarques
    },
    include: {
      institut: {
        select: {
          id: true,
          nom: true,
          code: true
        }
      },
      createur: {
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
 * Supprime une situation quotidienne
 * @param {string} id - L'ID de la situation à supprimer
 * @returns {Promise<Object>} La situation supprimée
 */
async function deleteSituation(id) {
  // Vérifier que la situation existe
  const situation = await prisma.dailySituation.findUnique({
    where: { id }
  });
  
  if (!situation) {
    throw new Error(`La situation avec l'ID ${id} n'existe pas`);
  }
  
  return await prisma.dailySituation.delete({
    where: { id }
  });
}

/**
 * Génère un rapport de tendance pour un institut sur une période donnée
 * @param {string} institutId - L'ID de l'institut
 * @param {string} dateDebut - Date de début de la période (YYYY-MM-DD)
 * @param {string} dateFin - Date de fin de la période (YYYY-MM-DD)
 * @returns {Promise<Object>} Rapport de tendance
 */
async function getSituationsTrend(institutId, dateDebut, dateFin) {
  // Valider l'institut
  const institut = await prisma.institut.findUnique({
    where: { id: institutId }
  });
  
  if (!institut) {
    throw new Error(`L'institut avec l'ID ${institutId} n'existe pas`);
  }
  
  // Préparer les dates
  const debut = dateDebut ? new Date(dateDebut) : new Date(new Date().setDate(new Date().getDate() - 30));
  const fin = dateFin ? new Date(dateFin) : new Date();
  
  // Récupérer les situations pour la période
  const situations = await prisma.dailySituation.findMany({
    where: {
      institutId,
      dateRapport: {
        gte: debut,
        lte: fin
      }
    },
    orderBy: {
      dateRapport: 'asc'
    }
  });
  
  // Calculer les moyennes et tendances
  const totalSituations = situations.length;
  
  if (totalSituations === 0) {
    return {
      institut: {
        id: institut.id,
        nom: institut.nom,
        code: institut.code
      },
      periode: {
        debut: debut.toISOString().split('T')[0],
        fin: fin.toISOString().split('T')[0]
      },
      message: "Aucune situation enregistrée pour cette période",
      data: []
    };
  }
  
  // Calculer les moyennes
  const moyenneMilitaires = situations.reduce((sum, s) => sum + s.militairesPresents, 0) / totalSituations;
  const moyenneCivils = situations.reduce((sum, s) => sum + s.civilsPresents, 0) / totalSituations;
  const moyenneProfesseurs = situations.reduce((sum, s) => sum + s.professeursPresents, 0) / totalSituations;
  const moyenneEtudiants = situations.reduce((sum, s) => sum + s.etudiantsPresents, 0) / totalSituations;
  
  // Calculer les tendances (comparer première et dernière semaine)
  const premiereSemaine = situations.slice(0, Math.min(7, Math.ceil(totalSituations / 2)));
  const derniereSemaine = situations.slice(-Math.min(7, Math.ceil(totalSituations / 2)));
  
  const calculerTendance = (premiere, derniere, categorie) => {
    const moyPremiere = premiere.reduce((sum, s) => sum + s[categorie], 0) / premiere.length;
    const moyDerniere = derniere.reduce((sum, s) => sum + s[categorie], 0) / derniere.length;
    
    const difference = ((moyDerniere - moyPremiere) / moyPremiere) * 100;
    return {
      difference: parseFloat(difference.toFixed(2)),
      direction: difference > 0 ? 'hausse' : difference < 0 ? 'baisse' : 'stable'
    };
  };
  
  return {
    institut: {
      id: institut.id,
      nom: institut.nom,
      code: institut.code
    },
    periode: {
      debut: debut.toISOString().split('T')[0],
      fin: fin.toISOString().split('T')[0],
      totalJours: totalSituations
    },
    moyennes: {
      militairesPresents: parseFloat(moyenneMilitaires.toFixed(2)),
      civilsPresents: parseFloat(moyenneCivils.toFixed(2)),
      professeursPresents: parseFloat(moyenneProfesseurs.toFixed(2)),
      etudiantsPresents: parseFloat(moyenneEtudiants.toFixed(2)),
      totalPersonnelPresent: parseFloat((moyenneMilitaires + moyenneCivils + moyenneProfesseurs + moyenneEtudiants).toFixed(2))
    },
    tendances: {
      militairesPresents: calculerTendance(premiereSemaine, derniereSemaine, 'militairesPresents'),
      civilsPresents: calculerTendance(premiereSemaine, derniereSemaine, 'civilsPresents'),
      professeursPresents: calculerTendance(premiereSemaine, derniereSemaine, 'professeursPresents'),
      etudiantsPresents: calculerTendance(premiereSemaine, derniereSemaine, 'etudiantsPresents')
    },
    situations: situations.map(s => ({
      date: s.dateRapport.toISOString().split('T')[0],
      militairesPresents: s.militairesPresents,
      civilsPresents: s.civilsPresents,
      professeursPresents: s.professeursPresents,
      etudiantsPresents: s.etudiantsPresents,
      total: s.militairesPresents + s.civilsPresents + s.professeursPresents + s.etudiantsPresents
    }))
  };
}

module.exports = {
  getAllSituations,
  getSituationById,
  createSituation,
  updateSituation,
  deleteSituation,
  getSituationsTrend
};