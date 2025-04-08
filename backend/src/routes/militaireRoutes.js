// src/routes/militaireRoutes.js
const militaireService = require('../services/militaireService');

module.exports = async function(fastify, opts) {
  // Récupérer tous les militaires avec pagination et filtres avancés
  fastify.get('/', {
    schema: {
      querystring: {
        type: 'object',
        properties: {
          page: { type: 'integer', default: 1 },
          limit: { type: 'integer', default: 10 },
          grade: { type: 'string' },
          categorie: { type: 'string' },
          institutId: { type: 'string' },
          armeId: { type: 'string' },
          specialiteId: { type: 'string' },
          sousUniteId: { type: 'string' },
          fonctionId: { type: 'string' },
          situation: { type: 'string' },
          search: { type: 'string' }
        }
      },
      response: {
        200: {
          type: 'object',
          properties: {
            data: { type: 'array' },
            pagination: {
              type: 'object',
              properties: {
                total: { type: 'integer' },
                page: { type: 'integer' },
                limit: { type: 'integer' },
                totalPages: { type: 'integer' }
              }
            }
          }
        }
      }
    },
    preHandler: [fastify.authenticate],
    handler: async (request, reply) => {
      try {
        const { 
          page, 
          limit, 
          grade, 
          categorie, 
          institutId, 
          armeId, 
          specialiteId, 
          sousUniteId, 
          fonctionId, 
          situation, 
          search 
        } = request.query;
        
        const militaires = await militaireService.getAllMilitaires({
          page,
          limit, 
          grade, 
          categorie,
          institutId,
          armeId,
          specialiteId,
          sousUniteId,
          fonctionId,
          situation,
          search
        });
        
        return militaires;
      } catch (error) {
        fastify.log.error(error);
        reply.code(500);
        return { error: 'Une erreur est survenue lors de la récupération des militaires' };
      }
    }
  });
  
  // Récupérer les statistiques des militaires
  fastify.get('/stats/overview', {
    preHandler: [fastify.authenticate],
    handler: async (request, reply) => {
      try {
        const stats = await militaireService.getMilitairesStats();
        
        return stats;
      } catch (error) {
        fastify.log.error(error);
        reply.code(500);
        return { error: 'Une erreur est survenue lors de la récupération des statistiques' };
      }
    }
  });

  // Récupérer tous les diplômes disponibles
  fastify.get('/diplomes', {
    preHandler: [fastify.authenticate],
    handler: async (request, reply) => {
      try {
        console.log('Route /diplomes called');
        const diplomes = await militaireService.getAllDiplomes();
        console.log('Fetched diplomes:', diplomes);
        return diplomes;
      } catch (error) {
        fastify.log.error(error);
        reply.code(500);
        return { error: 'Une erreur est survenue lors de la récupération des diplômes' };
      }
    }
  });
  
  // Récupérer un militaire par matricule
  fastify.get('/matricule/:matricule', {
    schema: {
      params: {
        type: 'object',
        required: ['matricule'],
        properties: {
          matricule: { type: 'string' }
        }
      }
    },
    preHandler: [fastify.authenticate],
    handler: async (request, reply) => {
      try {
        const { matricule } = request.params;
        
        const militaire = await militaireService.getMilitaireByMatricule(matricule);
        
        if (!militaire) {
          reply.code(404);
          return { error: `Aucun militaire trouvé avec le matricule ${matricule}` };
        }
        
        return militaire;
      } catch (error) {
        fastify.log.error(error);
        reply.code(500);
        return { error: 'Une erreur est survenue lors de la récupération du militaire' };
      }
    }
  });
  
  // Récupérer un militaire par ID - This route must come AFTER other specific routes
  fastify.get('/:id', {
    schema: {
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'string' }
        }
      }
    },
    preHandler: [fastify.authenticate],
    handler: async (request, reply) => {
      try {
        const { id } = request.params;
        
        const militaire = await militaireService.getMilitaireById(id);
        
        if (!militaire) {
          reply.code(404);
          return { error: `Aucun militaire trouvé avec l'ID ${id}` };
        }
        
        return militaire;
      } catch (error) {
        fastify.log.error(error);
        reply.code(500);
        return { error: 'Une erreur est survenue lors de la récupération du militaire' };
      }
    }
  });
  
  // Créer un nouveau militaire
// Update the POST route schema in militaireRoutes.js
fastify.post('/', {
  schema: {
    body: {
      type: 'object',
      required: ['nom', 'prenom', 'nni', 'matricule', 'grade', 'categorie'],
      properties: {
        // Données du personnel
        nom: { type: 'string' },
        prenom: { type: 'string' },
        dateNaissance: { type: 'string', format: 'date' },
        lieuNaissance: { type: 'string' },
        telephone: { type: 'string' },
        email: { type: 'string', format: 'email' },
        nni: { type: 'string' },
        uniteId: { type: 'string' },
        
        // Données spécifiques au militaire
        matricule: { type: 'string' },
        grade: { 
          type: 'string', 
          enum: [
            // Officiers Supérieurs
            'COMMANDANT', 'LIEUTENANT_COLONEL', 'COLONEL', 'GENERAL',
            'MEDECIN_COMMANDANT', 'MEDECIN_LIEUTENANT_COLONEL', 'MEDECIN_COLONEL', 'MEDECIN_GENERAL',
            'INTENDANT_COMMANDANT', 'INTENDANT_LIEUTENANT_COLONEL', 'INTENDANT_COLONEL', 'INTENDANT_GENERAL',
            'COMMANDANT_INGENIEUR', 'LIEUTENANT_COLONEL_INGENIEUR', 'COLONEL_INGENIEUR', 'GENERAL_INGENIEUR',
            
            // Officiers Subalternes
            'SOUS_LIEUTENANT', 'LIEUTENANT', 'CAPITAINE',
            'LIEUTENANT_INGENIEUR', 'CAPITAINE_INGENIEUR',
            'INTENDANT_SOUS_LIEUTENANT', 'INTENDANT_LIEUTENANT', 'INTENDANT_CAPITAINE',
            'MEDECIN_LIEUTENANT', 'MEDECIN_CAPITAINE',
            
            // Sous-Officiers Supérieurs
            'ADJUDANT', 'ADJUDANT_CHEF',
            
            // Sous-Officiers Subalternes
            'SERGENT', 'SERGENT_CHEF',
            
            // Soldats
            'SOLDAT_DEUXIEME_CLASSE', 'SOLDAT_PREMIERE_CLASSE', 'CAPORAL'
          ] 
        },
        categorie: { type: 'string', enum: ['OFFICIER', 'SOUS_OFFICIER', 'SOLDAT'] },
        categorieOfficier: { 
          type: ['string', 'null'], // Allow both string and null
          enum: ['OFFICIER_SUPERIEUR', 'OFFICIER_SUBALTERNE', null] // Include null in enum
        },
        categorieSousOfficier: { 
          type: ['string', 'null'], // Allow both string and null
          enum: ['SOUS_OFFICIER_SUPERIEUR', 'SOUS_OFFICIER_SUBALTERNE', null] // Include null in enum
        },
        groupeSanguin: { type: 'string', enum: ['A_POSITIF', 'A_NEGATIF', 'B_POSITIF', 'B_NEGATIF', 'AB_POSITIF', 'AB_NEGATIF', 'O_POSITIF', 'O_NEGATIF'] },
        dateRecrutement: { type: 'string', format: 'date' },
        telephoneService: { type: 'string' },
        dateDernierePromotion: { type: 'string', format: 'date' },
        situation: { type: 'string', enum: ['PRESENT', 'ABSENT', 'MISSION', 'CONGE', 'HOSPITALISATION', 'FORMATION', 'DETACHEMENT', 'RETRAITE', 'DISPONIBILITE', 'DESERTEUR', 'AUTRE'] },
        situationDetail: { type: 'string' },
        situationDepuis: { type: 'string', format: 'date' },
        situationJusqua: { type: 'string', format: 'date' },
        fonctionId: { type: 'string' },
        sousUniteId: { type: 'string' },
        armeId: { type: 'string' },
        specialiteId: { type: 'string' }
      }
    }
  },
  preHandler: [fastify.authenticate],
  handler: async (request, reply) => {
    try {
      const militaireData = request.body;
      
      const nouveauMilitaire = await militaireService.createMilitaire(militaireData);
      
      reply.code(201);
      return nouveauMilitaire;
    } catch (error) {
      fastify.log.error(error);
      
      if (error.message && error.message.includes('existe déjà')) {
        reply.code(409);
        return { error: error.message };
      }
      
      reply.code(500);
      return { error: 'Une erreur est survenue lors de la création du militaire' };
    }
  }
})

  // Ajouter un diplôme à un militaire
  fastify.post('/:id/diplomes', {
    schema: {
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'string' }
        }
      },
      body: {
        type: 'object',
        required: ['diplomeId', 'institution', 'dateObtention'],
        properties: {
          diplomeId: { type: 'string' },
          institution: { type: 'string' },
          dateObtention: { type: 'string', format: 'date' },
          observations: { type: 'string' }
        }
      }
    },
    preHandler: [fastify.authenticate],
    handler: async (request, reply) => {
      try {
        const { id } = request.params;
        const diplomeData = request.body;
        
        console.log(`Adding diploma to militaire ${id}:`, diplomeData);
        const diplome = await militaireService.addDiplome(id, diplomeData);
        console.log('Diploma added:', diplome);
        
        reply.code(201);
        return diplome;
      } catch (error) {
        fastify.log.error(error);
        
        if (error.message && error.message.includes('n\'existe pas')) {
          reply.code(404);
          return { error: error.message };
        }
        
        reply.code(500);
        return { error: 'Une erreur est survenue lors de l\'ajout du diplôme' };
      }
    }
  });
 
  
  // Ajouter une notation à un militaire
  fastify.post('/:id/notations', {
    schema: {
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'string' }
        }
      },
      body: {
        type: 'object',
        required: ['typeNotation', 'note', 'notateur'],
        properties: {
          typeNotation: { type: 'string', enum: ['ANNUELLE', 'EXCEPTIONNELLE', 'STAGE', 'MISSION'] },
          date: { type: 'string', format: 'date' },
          note: { type: 'number', minimum: 0, maximum: 20 },
          observations: { type: 'string' },
          notateur: { type: 'string' }
        }
      }
    },
    preHandler: [fastify.authenticate],
    handler: async (request, reply) => {
      try {
        const { id } = request.params;
        const notationData = request.body;
        
        const notation = await militaireService.addNotation(id, notationData);
        
        reply.code(201);
        return notation;
      } catch (error) {
        fastify.log.error(error);
        
        if (error.message && error.message.includes('n\'existe pas')) {
          reply.code(404);
          return { error: error.message };
        }
        
        reply.code(500);
        return { error: 'Une erreur est survenue lors de l\'ajout de la notation' };
      }
    }
  });
  
  // Ajouter un stage militaire à un militaire
  fastify.post('/:id/stages-militaires', {
    schema: {
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'string' }
        }
      },
      body: {
        type: 'object',
        required: ['titre', 'lieu', 'dateDebut'],
        properties: {
          titre: { type: 'string' },
          description: { type: 'string' },
          lieu: { type: 'string' },
          dateDebut: { type: 'string', format: 'date' },
          dateFin: { type: 'string', format: 'date' },
          statut: { type: 'string', enum: ['EN_COURS', 'EFFECTUE', 'ANNULE', 'PLANIFIE'] },
          certificat: { type: 'string' },
          observations: { type: 'string' }
        }
      }
    },
    preHandler: [fastify.authenticate],
    handler: async (request, reply) => {
      try {
        const { id } = request.params;
        const stageData = request.body;
        
        const stage = await militaireService.addStageMilitaire(id, stageData);
        
        reply.code(201);
        return stage;
      } catch (error) {
        fastify.log.error(error);
        
        if (error.message && error.message.includes('n\'existe pas')) {
          reply.code(404);
          return { error: error.message };
        }
        
        reply.code(500);
        return { error: 'Une erreur est survenue lors de l\'ajout du stage militaire' };
      }
    }
  });
  
  // Récupérer l'historique des situations d'un militaire
  fastify.get('/:id/situations-historique', {
    schema: {
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'string' }
        }
      }
    },
    preHandler: [fastify.authenticate],
    handler: async (request, reply) => {
      try {
        const { id } = request.params;
        
        const historique = await militaireService.getMilitaireSituationHistory(id);
        
        return historique;
      } catch (error) {
        fastify.log.error(error);
        
        if (error.message && error.message.includes('n\'existe pas')) {
          reply.code(404);
          return { error: error.message };
        }
        
        reply.code(500);
        return { error: 'Une erreur est survenue lors de la récupération de l\'historique des situations' };
      }
    }
  });
  
  // Mettre à jour la situation d'un militaire
  fastify.put('/:id/situation', {
    schema: {
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'string' }
        }
      },
      body: {
        type: 'object',
        required: ['situation'],
        properties: {
          situation: { type: 'string', enum: ['PRESENT', 'ABSENT', 'MISSION', 'CONGE', 'HOSPITALISATION', 'FORMATION', 'DETACHEMENT', 'RETRAITE', 'DISPONIBILITE', 'DESERTEUR', 'AUTRE'] },
          situationDetail: { type: 'string' },
          situationDepuis: { type: 'string', format: 'date' },
          situationJusqua: { type: 'string', format: 'date' },
          observations: { type: 'string' }
        }
      }
    },
    preHandler: [fastify.authenticate],
    handler: async (request, reply) => {
      try {
        const { id } = request.params;
        const situationData = request.body;
        
        const militaireMisAJour = await militaireService.updateMilitaireSituation(id, situationData);
        
        return militaireMisAJour;
      } catch (error) {
        fastify.log.error(error);
        
        if (error.message && error.message.includes('n\'existe pas')) {
          reply.code(404);
          return { error: error.message };
        }
        
        reply.code(500);
        return { error: 'Une erreur est survenue lors de la mise à jour de la situation du militaire' };
      }
    }
  });
  
  // Mettre à jour un militaire
// Update the PUT route schema in militaireRoutes.js
fastify.put('/:id', {
  schema: {
    params: {
      type: 'object',
      required: ['id'],
      properties: {
        id: { type: 'string' }
      }
    },
    body: {
      type: 'object',
      properties: {
        // Données du personnel
        nom: { type: 'string' },
        prenom: { type: 'string' },
        dateNaissance: { type: 'string', format: 'date' },
        lieuNaissance: { type: 'string' },
        telephone: { type: 'string' },
        email: { type: 'string', format: 'email' },
        nni: { type: 'string' },
        uniteId: { type: 'string' },
        
        // Données spécifiques au militaire
        grade: { 
          type: 'string', 
          enum: [
            // Officiers Supérieurs
            'COMMANDANT', 'LIEUTENANT_COLONEL', 'COLONEL', 'GENERAL',
            'MEDECIN_COMMANDANT', 'MEDECIN_LIEUTENANT_COLONEL', 'MEDECIN_COLONEL', 'MEDECIN_GENERAL',
            'INTENDANT_COMMANDANT', 'INTENDANT_LIEUTENANT_COLONEL', 'INTENDANT_COLONEL', 'INTENDANT_GENERAL',
            'COMMANDANT_INGENIEUR', 'LIEUTENANT_COLONEL_INGENIEUR', 'COLONEL_INGENIEUR', 'GENERAL_INGENIEUR',
            
            // Officiers Subalternes
            'SOUS_LIEUTENANT', 'LIEUTENANT', 'CAPITAINE',
            'LIEUTENANT_INGENIEUR', 'CAPITAINE_INGENIEUR',
            'INTENDANT_SOUS_LIEUTENANT', 'INTENDANT_LIEUTENANT', 'INTENDANT_CAPITAINE',
            'MEDECIN_LIEUTENANT', 'MEDECIN_CAPITAINE',
            
            // Sous-Officiers Supérieurs
            'ADJUDANT', 'ADJUDANT_CHEF',
            
            // Sous-Officiers Subalternes
            'SERGENT', 'SERGENT_CHEF',
            
            // Soldats
            'SOLDAT_DEUXIEME_CLASSE', 'SOLDAT_PREMIERE_CLASSE', 'CAPORAL'
          ] 
        },
        categorie: { type: 'string', enum: ['OFFICIER', 'SOUS_OFFICIER', 'SOLDAT'] },
        categorieOfficier: { 
          type: ['string', 'null'], 
          enum: ['OFFICIER_SUPERIEUR', 'OFFICIER_SUBALTERNE', null] 
        },
        categorieSousOfficier: { 
          type: ['string', 'null'], 
          enum: ['SOUS_OFFICIER_SUPERIEUR', 'SOUS_OFFICIER_SUBALTERNE', null] 
        },
        groupeSanguin: { type: 'string', enum: ['A_POSITIF', 'A_NEGATIF', 'B_POSITIF', 'B_NEGATIF', 'AB_POSITIF', 'AB_NEGATIF', 'O_POSITIF', 'O_NEGATIF'] },
        dateRecrutement: { type: 'string', format: 'date' },
        telephoneService: { type: 'string' },
        dateDernierePromotion: { type: 'string', format: 'date' },
        situation: { type: 'string', enum: ['PRESENT', 'ABSENT', 'MISSION', 'CONGE', 'HOSPITALISATION', 'FORMATION', 'DETACHEMENT', 'RETRAITE', 'DISPONIBILITE', 'DESERTEUR', 'AUTRE'] },
        situationDetail: { type: 'string' },
        situationDepuis: { type: 'string', format: 'date' },
        situationJusqua: { type: 'string', format: 'date' },
        fonctionId: { type: 'string' },
        sousUniteId: { type: 'string' },
        armeId: { type: 'string' },
        specialiteId: { type: 'string' }
      }
    }
  },
  preHandler: [fastify.authenticate],
  handler: async (request, reply) => {
    try {
      const { id } = request.params;
      const militaireData = request.body;
      
      const militaireMisAJour = await militaireService.updateMilitaire(id, militaireData);
      
      return militaireMisAJour;
    } catch (error) {
      fastify.log.error(error);
      
      if (error.message && error.message.includes('n\'existe pas')) {
        reply.code(404);
        return { error: error.message };
      }
      
      reply.code(500);
      return { error: 'Une erreur est survenue lors de la mise à jour du militaire' };
    }
  }
})

  // Supprimer un diplôme d'un militaire
  fastify.delete('/:id/diplomes/:diplomeId', {
    schema: {
      params: {
        type: 'object',
        required: ['id', 'diplomeId'],
        properties: {
          id: { type: 'string' },
          diplomeId: { type: 'string' }
        }
      }
    },
    preHandler: [fastify.authenticate],
    handler: async (request, reply) => {
      try {
        const { id, diplomeId } = request.params;
        
        console.log(`Deleting diploma ${diplomeId} from militaire ${id}`);
        const result = await militaireService.deleteDiplome(id, diplomeId);
        console.log('Diploma delete result:', result);
        
        return result;
      } catch (error) {
        fastify.log.error(error);
        
        if (error.message && error.message.includes('n\'existe pas')) {
          reply.code(404);
          return { error: error.message };
        }
        
        if (error.message && error.message.includes('n\'appartient pas')) {
          reply.code(400);
          return { error: error.message };
        }
        
        reply.code(500);
        return { error: 'Une erreur est survenue lors de la suppression du diplôme' };
      }
    }
  });
  
  // Supprimer un militaire
  fastify.delete('/:id', {
    schema: {
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'string' }
        }
      }
    },
    preHandler: [fastify.authenticate],
    handler: async (request, reply) => {
      try {
        const { id } = request.params;
        
        const militaireSupprime = await militaireService.deleteMilitaire(id);
        
        return { message: 'Militaire supprimé avec succès', militaire: militaireSupprime };
      } catch (error) {
        fastify.log.error(error);
        
        if (error.message && error.message.includes('n\'existe pas')) {
          reply.code(404);
          return { error: error.message };
        }
        
        reply.code(500);
        return { error: 'Une erreur est survenue lors de la suppression du militaire' };
      }
    }
  });

// Récupérer toutes les décorations disponibles
fastify.get('/decorations', {
  preHandler: [fastify.authenticate],
  handler: async (request, reply) => {
    try {
      const decorations = await militaireService.getAllDecorations();
      return decorations;
    } catch (error) {
      fastify.log.error(error);
      reply.code(500);
      return { error: 'Une erreur est survenue lors de la récupération des décorations' };
    }
  }
});

// Récupérer une décoration par ID
fastify.get('/decorations/:id', {
  schema: {
    params: {
      type: 'object',
      required: ['id'],
      properties: {
        id: { type: 'string' }
      }
    }
  },
  preHandler: [fastify.authenticate],
  handler: async (request, reply) => {
    try {
      const { id } = request.params;
      const decoration = await militaireService.getDecorationById(id);
      
      if (!decoration) {
        reply.code(404);
        return { error: `Aucune décoration trouvée avec l'ID ${id}` };
      }
      
      return decoration;
    } catch (error) {
      fastify.log.error(error);
      reply.code(500);
      return { error: 'Une erreur est survenue lors de la récupération de la décoration' };
    }
  }
});

// Ajouter une décoration à un militaire
fastify.post('/:id/decorations', {
  schema: {
    params: {
      type: 'object',
      required: ['id'],
      properties: {
        id: { type: 'string' }
      }
    },
    body: {
      type: 'object',
      required: ['decorationId', 'dateObtention'],
      properties: {
        decorationId: { type: 'string' },
        description: { type: 'string' },
        dateObtention: { type: 'string', format: 'date' },
        observations: { type: 'string' }
      }
    }
  },
  preHandler: [fastify.authenticate],
  handler: async (request, reply) => {
    try {
      const { id } = request.params;
      const decorationData = request.body;
      
      const decoration = await militaireService.addMilitaireDecoration(id, decorationData);
      
      reply.code(201);
      return decoration;
    } catch (error) {
      fastify.log.error(error);
      
      if (error.message && error.message.includes('n\'existe pas')) {
        reply.code(404);
        return { error: error.message };
      }
      
      reply.code(500);
      return { error: 'Une erreur est survenue lors de l\'ajout de la décoration' };
    }
  }
});

// Supprimer une décoration d'un militaire
fastify.delete('/:id/decorations/:decorationId', {
  schema: {
    params: {
      type: 'object',
      required: ['id', 'decorationId'],
      properties: {
        id: { type: 'string' },
        decorationId: { type: 'string' }
      }
    }
  },
  preHandler: [fastify.authenticate],
  handler: async (request, reply) => {
    try {
      const { id, decorationId } = request.params;
      
      const result = await militaireService.deleteMilitaireDecoration(id, decorationId);
      
      return result;
    } catch (error) {
      fastify.log.error(error);
      
      if (error.message && error.message.includes('n\'existe pas')) {
        reply.code(404);
        return { error: error.message };
      }
      
      if (error.message && error.message.includes('n\'appartient pas')) {
        reply.code(400);
        return { error: error.message };
      }
      
      reply.code(500);
      return { error: 'Une erreur est survenue lors de la suppression de la décoration' };
    }
  }
});

};
