// src/services/militaireService.js
const { PrismaClient } = require('@prisma/client');
const personnelService = require('./personnelService');

const prisma = new PrismaClient();

/**
 * Récupère tous les militaires avec pagination et filtrage
 * @param {Object} options - Options de filtrage et pagination
 * @returns {Promise<Object>} Liste des militaires paginée
 */
async function getAllMilitaires({ 
  page = 1, 
  limit = 10, 
  grade = null, 
  categorie = null,
  armeId = null,
  specialiteId = null,
  sousUniteId = null,
  fonctionId = null,
  situation = null,
  uniteId = null,  // Changed from institutId to uniteId
  search = null 
}) {
  // Construire la requête de filtrage
  const where = {
    personnel: {
      typePersonnel: 'MILITAIRE'
    }
  };
  
  if (grade) {
    where.grade = grade;
  }
  
  if (categorie) {
    where.categorie = categorie;
  }
  
  if (armeId) {
    where.armeId = armeId;
  }
  
  if (specialiteId) {
    where.specialiteId = specialiteId;
  }
  
  if (sousUniteId) {
    where.sousUniteId = sousUniteId;
  }
  
  if (fonctionId) {
    where.fonctionId = fonctionId;
  }
  
  if (situation) {
    where.situation = situation;
  }
  
  if (uniteId) {  // Updated to use uniteId instead of institutId
    where.personnel = {
      ...where.personnel,
      uniteId
    };
  }
  
  if (search) {
    where.OR = [
      {
        personnel: {
          OR: [
            { nom: { contains: search, mode: 'insensitive' } },
            { prenom: { contains: search, mode: 'insensitive' } },
            { nni: { contains: search } }
          ]
        }
      },
      { matricule: { contains: search } }
    ];
  }
  
  // Calculer le nombre total avec ces filtres
  const total = await prisma.militaire.count({ where });
  
  // Calculer l'offset pour la pagination
  const skip = (page - 1) * limit;
  
  // Récupérer les données paginées avec relations
  const militaires = await prisma.militaire.findMany({
    where,
    skip,
    take: limit,
    include: {
      personnel: {
        include: {
          unite: {
            // Include unite information with its specific type details
            include: {
              institut: true,
              dct: true,
              pc: true
            }
          }
        }
      },
      fonction: true,
      sousUnite: {
        include: {
          unite: true
        }
      },
      arme: true,
      specialite: true
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
 * Récupère un militaire par son ID avec toutes ses relations
 * @param {string} id - L'ID du militaire
 * @returns {Promise<Object>} Le militaire trouvé
 */
async function getMilitaireById(id) {
  return await prisma.militaire.findUnique({
    where: { id },
    include: {
      personnel: {
        include: {
          unite: {
            // Include unite information with its specific type details
            include: {
              institut: true,
              dct: true,
              pc: true
            }
          },
          documents: {
            include: {
              uploadeur: {
                select: {
                  id: true,
                  name: true
                }
              }
            }
          },
          diplomes: true
        }
      },
      fonction: true,
      sousUnite: {
        include: {
          unite: true
        }
      },
      arme: true,
      specialite: true,
      // Replace decorations with militaireDecorations
      militaireDecorations: {
        include: {
          decoration: true
        }
      },
      notations: {
        orderBy: {
          date: 'desc'
        }
      },
      stagesMilitaires: {
        orderBy: {
          dateDebut: 'desc'
        }
      },
      situationsHistorique: {
        orderBy: {
          dateDebut: 'desc'
        }
      }
    }
  });
}

/**
 * Récupère un militaire par son matricule
 * @param {string} matricule - Le matricule du militaire
 * @returns {Promise<Object>} Le militaire trouvé
 */
async function getMilitaireByMatricule(matricule) {
  return await prisma.militaire.findUnique({
    where: { matricule },
    include: {
      personnel: {
        include: {
          unite: {
            // Include unite information with its specific type details
            include: {
              institut: true,
              dct: true,
              pc: true
            }
          },
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
      fonction: true,
      sousUnite: {
        include: {
          unite: true
        }
      },
      arme: true,
      specialite: true
    }
  });
}

/**
 * Crée un nouveau militaire avec toutes ses données
 * @param {Object} militaireData - Les données du militaire et du personnel
 * @returns {Promise<Object>} Le militaire créé
 */
async function createMilitaire(militaireData) {
  const {
    // Données du personnel
    nom,
    prenom,
    dateNaissance,
    lieuNaissance,
    telephone,
    email,
    nni,
    uniteId,  // Changed from institutId to uniteId
    
    // Données spécifiques au militaire
    matricule,
    grade,
    categorie,
    categorieOfficier, // This could be null
    categorieSousOfficier, // This could be null
    groupeSanguin,
    dateRecrutement,
    telephoneService,
    dateDernierePromotion,
    situation,
    situationDetail,
    situationDepuis,
    situationJusqua,
    fonctionId,    // Add these variables to the destructuring
    sousUniteId,   // Add these variables to the destructuring
    armeId,        // Add these variables to the destructuring
    specialiteId   // Add these variables to the destructuring
  } = militaireData;
  
  // Vérifier si un militaire avec ce matricule existe déjà
  const existingMilitaire = await prisma.militaire.findUnique({
    where: { matricule }
  });
  
  if (existingMilitaire) {
    throw new Error(`Un militaire avec le matricule ${matricule} existe déjà`);
  }
  
  // Vérifier que l'unité existe
  if (uniteId) {
    const unite = await prisma.unite.findUnique({
      where: { id: uniteId }
    });
    
    if (!unite) {
      throw new Error(`L'unité avec l'ID ${uniteId} n'existe pas`);
    }
  }
  
  // Vérifications des relations
  // Fonction
  if (fonctionId) {
    const fonction = await prisma.fonction.findUnique({
      where: { id: fonctionId }
    });
    
    if (!fonction) {
      throw new Error(`La fonction avec l'ID ${fonctionId} n'existe pas`);
    }
  }
  
  // SousUnite
  if (sousUniteId) {
    const sousUnite = await prisma.sousUnite.findUnique({
      where: { id: sousUniteId }
    });
    
    if (!sousUnite) {
      throw new Error(`La sous-unité avec l'ID ${sousUniteId} n'existe pas`);
    }
  }
  
  // Arme
  if (armeId) {
    const arme = await prisma.arme.findUnique({
      where: { id: armeId }
    });
    
    if (!arme) {
      throw new Error(`L'arme avec l'ID ${armeId} n'existe pas`);
    }
  }
  
  // Specialite
  if (specialiteId) {
    const specialite = await prisma.specialite.findUnique({
      where: { id: specialiteId }
    });
    
    if (!specialite) {
      throw new Error(`La spécialité avec l'ID ${specialiteId} n'existe pas`);
    }
  }
  
  // Build the category data with explicit null values when needed
  let categoryData = {};
  
  // Only include categorieOfficier if appropriate
  if (categorie === 'OFFICIER') {
    categoryData.categorieOfficier = categorieOfficier;
    categoryData.categorieSousOfficier = null; // Explicitly set to null for OFFICIER
  } 
  // Only include categorieSousOfficier if appropriate
  else if (categorie === 'SOUS_OFFICIER') {
    categoryData.categorieOfficier = null; // Explicitly set to null for SOUS_OFFICIER
    categoryData.categorieSousOfficier = categorieSousOfficier;
  } 
  // For SOLDAT, both should be null
  else if (categorie === 'SOLDAT') {
    categoryData.categorieOfficier = null;
    categoryData.categorieSousOfficier = null;
  }
  
  // Utiliser une transaction pour créer à la fois le personnel et le militaire
  return await prisma.$transaction(async (tx) => {
    // 1. Créer le personnel de base
    const personnel = await tx.personnel.create({
      data: {
        typePersonnel: 'MILITAIRE',
        nom,
        prenom,
        dateNaissance: dateNaissance ? new Date(dateNaissance) : null,
        lieuNaissance,
        telephone,
        email,
        nni,
        uniteId  // Changed from institutId to uniteId
      }
    });
    
    // 2. Créer le militaire associé - create the data object first
    let militaireCreateData = {
      matricule,
      grade,
      categorie,
      ...categoryData, // Using the processed category data that's now defined
      groupeSanguin,
      dateRecrutement: dateRecrutement ? new Date(dateRecrutement) : null,
      telephoneService,
      dateDernierePromotion: dateDernierePromotion ? new Date(dateDernierePromotion) : null,
      situation: situation || 'PRESENT',
      situationDetail,
      situationDepuis: situationDepuis ? new Date(situationDepuis) : new Date(),
      situationJusqua: situationJusqua ? new Date(situationJusqua) : null,
      personnelId: personnel.id
    };

    // Only add these fields if they are valid values
    if (fonctionId && fonctionId.trim() !== '') {
      militaireCreateData.fonctionId = fonctionId;
    }
    if (sousUniteId && sousUniteId.trim() !== '') {
      militaireCreateData.sousUniteId = sousUniteId;
    }
    if (armeId && armeId.trim() !== '') {
      militaireCreateData.armeId = armeId;
    }
    if (specialiteId && specialiteId.trim() !== '') {
      militaireCreateData.specialiteId = specialiteId;
    }
    
    const militaire = await tx.militaire.create({
      data: militaireCreateData,
      include: {
        personnel: {
          include: {
            unite: {
              // Include unite information with its specific type details
              include: {
                institut: true,
                dct: true,
                pc: true
              }
            }
          }
        },
        fonction: true,
        sousUnite: true,
        arme: true,
        specialite: true
      }
    });
    
    // Si une situation autre que PRESENT est définie, créer une entrée historique
    if (situation && situation !== 'PRESENT') {
      await tx.situationHistorique.create({
        data: {
          situation: 'PRESENT',
          dateDebut: new Date(new Date().setMonth(new Date().getMonth() - 3)), // Exemple: 3 mois plus tôt
          dateFin: new Date(),
          militaireId: militaire.id
        }
      });
    }
    
    return militaire;
  });
}
/**
 * Met à jour un militaire existant avec toutes ses données
 * @param {string} id - L'ID du militaire à mettre à jour
 * @param {Object} militaireData - Les nouvelles données du militaire
 * @returns {Promise<Object>} Le militaire mis à jour
 */
async function updateMilitaire(id, militaireData) {
  const {
    // Données du personnel
    nom,
    prenom,
    dateNaissance,
    lieuNaissance,
    telephone,
    email,
    uniteId,  // Changed from institutId to uniteId
    nni,
    
    // Données spécifiques au militaire
    grade,
    categorie,
    categorieOfficier,
    categorieSousOfficier,
    groupeSanguin,
    dateRecrutement,
    telephoneService,
    dateDernierePromotion,
    situation,
    situationDetail,
    situationDepuis,
    situationJusqua,
    fonctionId,
    sousUniteId,
    armeId,
    specialiteId
  } = militaireData;
  
  // Vérifier que le militaire existe
  const militaire = await prisma.militaire.findUnique({
    where: { id },
    include: {
      personnel: true
    }
  });
  
  if (!militaire) {
    throw new Error(`Le militaire avec l'ID ${id} n'existe pas`);
  }
  
  // Vérifications des relations si elles sont spécifiées
  // Unité (anciennement institut)
  if (uniteId) {
    const unite = await prisma.unite.findUnique({
      where: { id: uniteId }
    });
    
    if (!unite) {
      throw new Error(`L'unité avec l'ID ${uniteId} n'existe pas`);
    }
  }
  
  // Fonction
  if (fonctionId) {
    const fonction = await prisma.fonction.findUnique({
      where: { id: fonctionId }
    });
    
    if (!fonction) {
      throw new Error(`La fonction avec l'ID ${fonctionId} n'existe pas`);
    }
  }
  
  // SousUnite
  if (sousUniteId) {
    const sousUnite = await prisma.sousUnite.findUnique({
      where: { id: sousUniteId }
    });
    
    if (!sousUnite) {
      throw new Error(`La sous-unité avec l'ID ${sousUniteId} n'existe pas`);
    }
  }
  
  // Arme
  if (armeId) {
    const arme = await prisma.arme.findUnique({
      where: { id: armeId }
    });
    
    if (!arme) {
      throw new Error(`L'arme avec l'ID ${armeId} n'existe pas`);
    }
  }
  
  // Specialite
  if (specialiteId) {
    const specialite = await prisma.specialite.findUnique({
      where: { id: specialiteId }
    });
    
    if (!specialite) {
      throw new Error(`La spécialité avec l'ID ${specialiteId} n'existe pas`);
    }
  }
  
  // Traiter la logique de sous-catégorie d'officier ou sous-officier selon le grade
  let categoryData = {};
  
  if (categorie === 'OFFICIER' && categorieOfficier) {
    categoryData.categorieOfficier = categorieOfficier;
    categoryData.categorieSousOfficier = null; // Réinitialiser l'autre catégorie
  } else if (categorie === 'SOUS_OFFICIER' && categorieSousOfficier) {
    categoryData.categorieSousOfficier = categorieSousOfficier;
    categoryData.categorieOfficier = null; // Réinitialiser l'autre catégorie
  } else if (categorie === 'SOLDAT') {
    // Réinitialiser les deux catégories pour un soldat
    categoryData.categorieOfficier = null;
    categoryData.categorieSousOfficier = null;
  }
  
  // Gérer le changement de situation
  const situationChanged = situation && militaire.situation !== situation;
  
  // Utiliser une transaction pour mettre à jour à la fois le personnel et le militaire
  return await prisma.$transaction(async (tx) => {
    // 1. Mettre à jour le personnel
    if (nom || prenom || dateNaissance || lieuNaissance || telephone || email || uniteId || nni) {
      await tx.personnel.update({
        where: { id: militaire.personnelId },
        data: {
          nom: nom || undefined,
          prenom: prenom || undefined,
          dateNaissance: dateNaissance ? new Date(dateNaissance) : undefined,
          lieuNaissance: lieuNaissance || undefined,
          telephone: telephone || undefined,
          email: email || undefined,
          uniteId: uniteId || undefined,  // Changed from institutId to uniteId
          nni: nni || undefined
        }
      });
    }
    
    // 2. Si la situation a changé, créer une entrée historique
    if (situationChanged) {
      await tx.situationHistorique.create({
        data: {
          situation: militaire.situation,
          detail: militaire.situationDetail,
          dateDebut: militaire.situationDepuis || new Date(new Date().setMonth(new Date().getMonth() - 1)),
          dateFin: new Date(),
          observations: `Situation modifiée de ${militaire.situation} à ${situation}`,
          militaireId: militaire.id
        }
      });
    }
    
    // 3. Mettre à jour le militaire
    const militaireMisAJour = await tx.militaire.update({
      where: { id },
      data: {
        grade: grade || undefined,
        categorie: categorie || undefined,
        ...categoryData,
        groupeSanguin: groupeSanguin || undefined,
        dateRecrutement: dateRecrutement ? new Date(dateRecrutement) : undefined,
        telephoneService: telephoneService || undefined,
        dateDernierePromotion: dateDernierePromotion ? new Date(dateDernierePromotion) : undefined,
        situation: situation || undefined,
        situationDetail: situationDetail || undefined,
        situationDepuis: situationChanged ? new Date() : (situationDepuis ? new Date(situationDepuis) : undefined),
        situationJusqua: situationJusqua ? new Date(situationJusqua) : undefined,
        fonctionId: fonctionId || undefined,
        sousUniteId: sousUniteId || undefined,
        armeId: armeId || undefined,
        specialiteId: specialiteId || undefined
      },
      include: {
        personnel: {
          include: {
            unite: {
              // Include unite information with its specific type details
              include: {
                institut: true,
                dct: true,
                pc: true
              }
            }
          }
        },
        fonction: true,
        sousUnite: {
          include: {
            unite: true
          }
        },
        arme: true,
        specialite: true
      }
    });
    
    return militaireMisAJour;
  });
}
/**
 * Supprime un militaire et ses dépendances
 * @param {string} id - L'ID du militaire à supprimer
 * @returns {Promise<Object>} Le militaire supprimé
 */
async function deleteMilitaire(id) {
  // Vérifier que le militaire existe
  const militaire = await prisma.militaire.findUnique({
    where: { id },
    include: {
      personnel: {
        include: {
          documents: true,
          diplomes: true
        }
      },
      decorations: true,
      notations: true,
      stagesMilitaires: true,
      situationsHistorique: true
    }
  });
  
  if (!militaire) {
    throw new Error(`Le militaire avec l'ID ${id} n'existe pas`);
  }
  
  // Utiliser une transaction pour supprimer toutes les dépendances
  return await prisma.$transaction(async (tx) => {
    // 1. Supprimer les décorations
    if (militaire.decorations.length > 0) {
      await tx.decoration.deleteMany({
        where: { militaireId: militaire.id }
      });
    }
    
    // 2. Supprimer les notations
    if (militaire.notations.length > 0) {
      await tx.notation.deleteMany({
        where: { militaireId: militaire.id }
      });
    }
    
    // 3. Supprimer les stages militaires
    if (militaire.stagesMilitaires.length > 0) {
      await tx.stageMilitaire.deleteMany({
        where: { militaireId: militaire.id }
      });
    }
    
    // 4. Supprimer l'historique des situations
    if (militaire.situationsHistorique.length > 0) {
      await tx.situationHistorique.deleteMany({
        where: { militaireId: militaire.id }
      });
    }
    
    // 5. Supprimer les documents associés au personnel
    if (militaire.personnel.documents.length > 0) {
      await tx.document.deleteMany({
        where: { personnelId: militaire.personnelId }
      });
    }
    
    // 6. Supprimer les diplômes associés au personnel
    if (militaire.personnel.diplomes.length > 0) {
      await tx.personnelDiplome.deleteMany({
        where: { personnelId: militaire.personnelId }
      });
    }
    
    // 7. Supprimer le militaire
    await tx.militaire.delete({
      where: { id }
    });
    
    // 8. Supprimer le personnel
    const personnelSupprime = await tx.personnel.delete({
      where: { id: militaire.personnelId }
    });
    
    return { ...militaire, personnel: personnelSupprime };
  });
}

/**
 * Récupère les statistiques des militaires
 * @returns {Promise<Object>} Les statistiques
 */
async function getMilitairesStats() {
  // Compter par catégorie
  const countByCategorie = await prisma.militaire.groupBy({
    by: ['categorie'],
    _count: {
      id: true
    }
  });
  
  // Compter par grade
  const countByGrade = await prisma.militaire.groupBy({
    by: ['grade'],
    _count: {
      id: true
    }
  });
  
  // Compter par arme (branche militaire)
  const countByArme = await prisma.militaire.findMany({
    where: {
      armeId: {
        not: null
      }
    },
    select: {
      arme: {
        select: {
          id: true,
          nom: true
        }
      }
    }
  });
  
  // Regrouper par arme
  const armeStats = {};
  countByArme.forEach(item => {
    if (item.arme) {
      armeStats[item.arme.nom] = (armeStats[item.arme.nom] || 0) + 1;
    }
  });
  
  // Compter par situation
  const countBySituation = await prisma.militaire.groupBy({
    by: ['situation'],
    _count: {
      id: true
    }
  });

  // Compter par unité (nouveau)
  const countByUnite = await prisma.militaire.findMany({
    select: {
      personnel: {
        select: {
          unite: {
            select: {
              id: true,
              nom: true,
              type: true
            }
          }
        }
      }
    }
  });

  // Regrouper par unité
  const uniteStats = {};
  countByUnite.forEach(item => {
    if (item.personnel?.unite) {
      const uniteName = item.personnel.unite.nom;
      uniteStats[uniteName] = (uniteStats[uniteName] || 0) + 1;
    }
  });
  
  // Total des militaires
  const total = await prisma.militaire.count();
  
  // Transformer les résultats en format plus lisible
  const categorieStats = countByCategorie.reduce((acc, curr) => {
    acc[curr.categorie] = curr._count.id;
    return acc;
  }, {});
  
  const gradeStats = countByGrade.reduce((acc, curr) => {
    acc[curr.grade] = curr._count.id;
    return acc;
  }, {});
  
  const situationStats = countBySituation.reduce((acc, curr) => {
    acc[curr.situation] = curr._count.id;
    return acc;
  }, {});
  
  return {
    total,
    parCategorie: categorieStats,
    parGrade: gradeStats,
    parArme: armeStats,
    parSituation: situationStats,
    parUnite: uniteStats // Nouveau
  };
}

/**
 * Met à jour la situation d'un militaire
 * @param {string} id - L'ID du militaire
 * @param {Object} situationData - Les données de la nouvelle situation
 * @returns {Promise<Object>} Le militaire mis à jour
 */
async function updateMilitaireSituation(id, situationData) {
  const {
    situation,
    situationDetail,
    situationDepuis,
    situationJusqua,
    observations
  } = situationData;
  
  // Vérifier que le militaire existe
  const militaire = await prisma.militaire.findUnique({
    where: { id }
  });
  
  if (!militaire) {
    throw new Error(`Le militaire avec l'ID ${id} n'existe pas`);
  }
  
  // Vérifier que la situation est valide
  if (!Object.values(prisma.SituationMilitaire).includes(situation)) {
    throw new Error(`La situation ${situation} n'est pas valide`);
  }
  
  return await prisma.$transaction(async (tx) => {
    // 1. Créer une entrée historique pour l'ancienne situation
    await tx.situationHistorique.create({
      data: {
        situation: militaire.situation,
        detail: militaire.situationDetail,
        dateDebut: militaire.situationDepuis || new Date(new Date().setMonth(new Date().getMonth() - 1)),
        dateFin: new Date(),
        observations: observations || `Situation modifiée de ${militaire.situation} à ${situation}`,
        militaireId: militaire.id
      }
    });
    
    // 2. Mettre à jour la situation du militaire
    const militaireMisAJour = await tx.militaire.update({
      where: { id },
      data: {
        situation,
        situationDetail,
        situationDepuis: situationDepuis ? new Date(situationDepuis) : new Date(),
        situationJusqua: situationJusqua ? new Date(situationJusqua) : null
      },
      include: {
        personnel: {
          include: {
            unite: {
              // Include unite information with its specific type details
              include: {
                institut: true,
                dct: true,
                pc: true
              }
            }
          }
        },
        fonction: true,
        sousUnite: true,
        arme: true,
        specialite: true
      }
    });
    
    return militaireMisAJour;
  });
}

/**
 * Récupère l'historique des situations d'un militaire
 * @param {string} id - L'ID du militaire
 * @returns {Promise<Array>} L'historique des situations
 */
async function getMilitaireSituationHistory(id) {
  // Vérifier que le militaire existe
  const militaire = await prisma.militaire.findUnique({
    where: { id }
  });
  
  if (!militaire) {
    throw new Error(`Le militaire avec l'ID ${id} n'existe pas`);
  }
  
  return await prisma.situationHistorique.findMany({
    where: {
      militaireId: id
    },
    orderBy: {
      dateDebut: 'desc'
    }
  });
}

/**
 * Ajoute une nouvelle décoration à un militaire
 * @param {string} militaireId - L'ID du militaire
 * @param {Object} decorationData - Les données de la décoration
 * @returns {Promise<Object>} La décoration créée
 */
async function addDecoration(militaireId, decorationData) {
  // Vérifier que le militaire existe
  const militaire = await prisma.militaire.findUnique({
    where: { id: militaireId }
  });
  
  if (!militaire) {
    throw new Error(`Le militaire avec l'ID ${militaireId} n'existe pas`);
  }
  
  const decoration = await prisma.decoration.create({
    data: {
      ...decorationData,
      dateObtention: decorationData.dateObtention ? new Date(decorationData.dateObtention) : new Date(),
      militaireId
    }
  });
  
  return decoration;
}

/**
 * Ajoute une nouvelle notation à un militaire
 * @param {string} militaireId - L'ID du militaire
 * @param {Object} notationData - Les données de la notation
 * @returns {Promise<Object>} La notation créée
 */
async function addNotation(militaireId, notationData) {
  // Vérifier que le militaire existe
  const militaire = await prisma.militaire.findUnique({
    where: { id: militaireId }
  });
  
  if (!militaire) {
    throw new Error(`Le militaire avec l'ID ${militaireId} n'existe pas`);
  }
  
  const notation = await prisma.notation.create({
    data: {
      ...notationData,
      date: notationData.date ? new Date(notationData.date) : new Date(),
      militaireId
    }
  });
  
  return notation;
}

/**
 * Ajoute un nouveau stage militaire à un militaire
 * @param {string} militaireId - L'ID du militaire
 * @param {Object} stageData - Les données du stage
 * @returns {Promise<Object>} Le stage créé
 */
async function addStageMilitaire(militaireId, stageData) {
  // Vérifier que le militaire existe
  const militaire = await prisma.militaire.findUnique({
    where: { id: militaireId }
  });
  
  if (!militaire) {
    throw new Error(`Le militaire avec l'ID ${militaireId} n'existe pas`);
  }
  
  const stage = await prisma.stageMilitaire.create({
    data: {
      ...stageData,
      dateDebut: stageData.dateDebut ? new Date(stageData.dateDebut) : new Date(),
      dateFin: stageData.dateFin ? new Date(stageData.dateFin) : null,
      militaireId
    }
  });
  
  return stage;
}

/**
 * Ajoute un diplôme à un militaire
 * @param {string} militaireId - L'ID du militaire
 * @param {Object} diplomeData - Les données du diplôme
 * @returns {Promise<Object>} Le diplôme créé
 */
async function addDiplome(militaireId, diplomeData) {
  const {
    diplomeId,
    description,
    dateObtention,
    observations
  } = diplomeData;
  
  // Vérifier que le militaire existe
  const militaire = await prisma.militaire.findUnique({
    where: { id: militaireId },
    include: {
      personnel: true
    }
  });
  
  if (!militaire) {
    throw new Error(`Le militaire avec l'ID ${militaireId} n'existe pas`);
  }
  
  // Vérifier que le diplôme existe
  const diplome = await prisma.diplome.findUnique({
    where: { id: diplomeId }
  });
  
  if (!diplome) {
    throw new Error(`Le diplôme avec l'ID ${diplomeId} n'existe pas`);
  }
  
  // Créer le diplôme du personnel
  const personnelDiplome = await prisma.personnelDiplome.create({
    data: {
      description,
      dateObtention: new Date(dateObtention),
      observations,
      personnelId: militaire.personnelId,
      diplomeId
    },
    include: {
      diplome: true
    }
  });
  
  return personnelDiplome;
}
/**
 * Supprime un diplôme d'un militaire
 * @param {string} militaireId - L'ID du militaire
 * @param {string} diplomeId - L'ID du diplôme à supprimer
 * @returns {Promise<Object>} Message de confirmation
 */
async function deleteDiplome(militaireId, diplomeId) {
  // Vérifier que le militaire existe
  const militaire = await prisma.militaire.findUnique({
    where: { id: militaireId },
    include: {
      personnel: {
        include: {
          diplomes: true
        }
      }
    }
  });
  
  if (!militaire) {
    throw new Error(`Le militaire avec l'ID ${militaireId} n'existe pas`);
  }
  
  // Vérifier que le diplôme appartient au militaire
  const personnelDiplome = militaire.personnel.diplomes.find(
    d => d.id === diplomeId
  );
  
  if (!personnelDiplome) {
    throw new Error(`Le diplôme avec l'ID ${diplomeId} n'appartient pas à ce militaire`);
  }
  
  // Supprimer le diplôme
  await prisma.personnelDiplome.delete({
    where: { id: diplomeId }
  });
  
  return { message: 'Diplôme supprimé avec succès' };
}

/**
 * Récupère tous les diplômes disponibles
 * @returns {Promise<Array>} Liste des diplômes
 */
async function getAllDiplomes() {
  return await prisma.diplome.findMany({
    orderBy: {
      titre: 'asc'
    }
  });
}

/**
 * Récupère toutes les décorations disponibles
 * @returns {Promise<Array>} Liste des décorations
 */
async function getAllDecorations() {
  return await prisma.decoration.findMany({
    orderBy: {
      titre: 'asc'
    }
  });
}

/**
 * Récupère une décoration par ID
 * @param {string} id - L'ID de la décoration
 * @returns {Promise<Object>} La décoration trouvée
 */
async function getDecorationById(id) {
  return await prisma.decoration.findUnique({
    where: { id }
  });
}

/**
 * Ajoute une décoration à un militaire
 * @param {string} militaireId - L'ID du militaire
 * @param {Object} decorationData - Les données de la décoration
 * @returns {Promise<Object>} La relation militaire-décoration créée
 */
async function addMilitaireDecoration(militaireId, decorationData) {
  const { decorationId, description, dateObtention, observations } = decorationData;
  
  // Vérifier que le militaire existe
  const militaire = await prisma.militaire.findUnique({
    where: { id: militaireId }
  });
  
  if (!militaire) {
    throw new Error(`Le militaire avec l'ID ${militaireId} n'existe pas`);
  }
  
  // Vérifier que la décoration existe
  const decoration = await prisma.decoration.findUnique({
    where: { id: decorationId }
  });
  
  if (!decoration) {
    throw new Error(`La décoration avec l'ID ${decorationId} n'existe pas`);
  }
  
  // Créer la relation militaire-décoration
  const militaireDecoration = await prisma.militaireDecoration.create({
    data: {
      militaireId,
      decorationId,
      description,
      dateObtention: dateObtention ? new Date(dateObtention) : new Date(),
      observations
    },
    include: {
      decoration: true
    }
  });
  
  return militaireDecoration;
}

/**
 * Supprime une décoration d'un militaire
 * @param {string} militaireId - L'ID du militaire
 * @param {string} decorationId - L'ID de la relation militaire-décoration à supprimer
 * @returns {Promise<Object>} Message de confirmation
 */
async function deleteMilitaireDecoration(militaireId, decorationId) {
  // Vérifier que le militaire existe
  const militaire = await prisma.militaire.findUnique({
    where: { id: militaireId },
    include: {
      militaireDecorations: true
    }
  });
  
  if (!militaire) {
    throw new Error(`Le militaire avec l'ID ${militaireId} n'existe pas`);
  }
  
  // Vérifier que la décoration appartient au militaire
  const decorationLink = militaire.militaireDecorations.find(
    d => d.id === decorationId
  );
  
  if (!decorationLink) {
    throw new Error(`La décoration avec l'ID ${decorationId} n'appartient pas à ce militaire`);
  }
  
  // Supprimer la relation
  await prisma.militaireDecoration.delete({
    where: { id: decorationId }
  });
  
  return { message: 'Décoration supprimée avec succès' };
}

module.exports = {
  getAllMilitaires,
  getMilitaireById,
  getMilitaireByMatricule,
  createMilitaire,
  updateMilitaire,
  deleteMilitaire,
  getMilitairesStats,
  updateMilitaireSituation,
  getMilitaireSituationHistory,
  addDecoration,
  addNotation,
  addStageMilitaire,
  addDiplome,
  deleteDiplome,
  getAllDiplomes,
  getAllDecorations,
  getDecorationById,
  addMilitaireDecoration,
  deleteMilitaireDecoration
};