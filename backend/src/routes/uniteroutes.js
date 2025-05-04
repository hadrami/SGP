// src/routes/uniteRoutes.js
const uniteService = require('../services/uniteService');

module.exports = async function(fastify, opts) {
  // Récupérer toutes les unités
  fastify.get('/', {
    schema: {
      description: 'Récupérer toutes les unités',
      tags: ['unites'],
      response: {
        200: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              nom: { type: 'string' },
              code: { type: 'string' },
              type: { type: 'string' },
              description: { type: 'string', nullable: true }
            }
          }
        }
      }
    },
    preHandler: fastify.authenticate
  }, async (request, reply) => {
    try {
      const unites = await uniteService.getAllUnites();
      return unites;
    } catch (error) {
      fastify.log.error(error);
      reply.code(500);
      return { error: 'Erreur interne du serveur' };
    }
  });

  // Récupérer une unité par ID
  fastify.get('/:id', {
    schema: {
      description: 'Récupérer une unité par son ID',
      tags: ['unites'],
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'string' }
        }
      }
    },
    preHandler: fastify.authenticate
  }, async (request, reply) => {
    try {
      const { id } = request.params;
      const unite = await uniteService.getUniteById(id);
      
      if (!unite) {
        reply.code(404);
        return { error: 'Unité non trouvée' };
      }
      
      return unite;
    } catch (error) {
      fastify.log.error(error);
      reply.code(500);
      return { error: 'Erreur interne du serveur' };
    }
  });

  // Récupérer une unité par code
  fastify.get('/code/:code', {
    schema: {
      description: 'Récupérer une unité par son code',
      tags: ['unites'],
      params: {
        type: 'object',
        required: ['code'],
        properties: {
          code: { type: 'string' }
        }
      }
    },
    preHandler: fastify.authenticate
  }, async (request, reply) => {
    try {
      const { code } = request.params;
      const unite = await uniteService.getUniteByCode(code);
      
      if (!unite) {
        reply.code(404);
        return { error: 'Unité non trouvée' };
      }
      
      return unite;
    } catch (error) {
      fastify.log.error(error);
      reply.code(500);
      return { error: 'Erreur interne du serveur' };
    }
  });

  // Récupérer les unités par type
  fastify.get('/type/:type', {
    schema: {
      description: 'Récupérer toutes les unités d\'un type spécifique',
      tags: ['unites'],
      params: {
        type: 'object',
        required: ['type'],
        properties: {
          type: { type: 'string', enum: ['INSTITUT', 'DCT', 'PC'] }
        }
      }
    },
    preHandler: fastify.authenticate
  }, async (request, reply) => {
    try {
      const { type } = request.params;
      const unites = await uniteService.getUnitesByType(type);
      return unites;
    } catch (error) {
      fastify.log.error(error);
      reply.code(500);
      return { error: 'Erreur interne du serveur' };
    }
  });

   // Récupérer le personnel d'une unité
   fastify.get('/:id/personnel', {
    schema: {
      description: 'Récupérer le personnel d\'une unité',
      tags: ['unites', 'personnel'],
      params: {
        type: 'object',
        required: ['id'],
        properties: { id: { type: 'string' } }
      },
      querystring: {
        type: 'object',
        properties: {
          page: { type: 'integer', default: 1 },
          limit: { type: 'integer', default: 10 },
          search: { type: 'string' },
          typePersonnel: { type: 'string' }
        }
      },
     response: {
      200: {
        type: 'object',
        properties: {
          data: {
            type: 'array',
            items: {
              type: 'object',
              additionalProperties: true    // ← allow all fields
            }
          },
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
    preHandler: fastify.authenticate
  }, async (request, reply) => {
    try {
      const { id } = request.params;
      const { page, limit, search, typePersonnel } = request.query;
      const result = await uniteService.getUnitePersonnel({
        uniteId: id,
        page,
        limit,
        search,
        typePersonnel
      });
      return result;
    } catch (error) {
      fastify.log.error(error);
      reply.code(500);
      return { error: 'Erreur lors de la récupération du personnel' };
    }
  });

  // Récupérer les statistiques d'une unité
  fastify.get('/:id/stats', {
    schema: {
      description: 'Récupérer les statistiques d\'une unité',
      tags: ['unites', 'stats'],
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'string' }
        }
      }
    },
    preHandler: fastify.authenticate
  }, async (request, reply) => {
    try {
      const { id } = request.params;
      const stats = await uniteService.getUniteStats(id);
      return stats;
    } catch (error) {
      fastify.log.error(error);
      
      if (error.message && error.message.includes('n\'existe pas')) {
        reply.code(404);
        return { error: error.message };
      }
      
      reply.code(500);
      return { error: 'Erreur interne du serveur' };
    }
  });

  // Récupérer les sous-unités d'une unité
  fastify.get('/:id/sous-unites', {
    schema: {
      description: 'Récupérer les sous-unités d\'une unité',
      tags: ['unites', 'sous-unites'],
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'string' }
        }
      }
    },
    preHandler: fastify.authenticate
  }, async (request, reply) => {
    try {
      const { id } = request.params;
      const sousUnites = await uniteService.getSousUnitesByUnite(id);
      
      return sousUnites;
    } catch (error) {
      fastify.log.error(error);
      
      if (error.message && error.message.includes('n\'existe pas')) {
        reply.code(404);
        return { error: error.message };
      }
      
      reply.code(500);
      return { error: 'Erreur interne du serveur' };
    }
  });

  // Créer une nouvelle unité
  fastify.post('/', {
    schema: {
      description: 'Créer une nouvelle unité',
      tags: ['unites'],
      body: {
        type: 'object',
        required: ['nom', 'code', 'type'],
        properties: {
          nom: { type: 'string' },
          code: { type: 'string' },
          description: { type: 'string' },
          type: { type: 'string', enum: ['INSTITUT', 'DCT', 'PC'] },
          directeurId: { type: 'integer' },
          // INSTITUT specific fields
          emplacement: { type: 'string' },
          anneeEtude: { type: 'integer' },
          specialite: { type: 'string' },
          // DCT specific fields
          domaine: { type: 'string' },
          niveau: { type: 'string' },
          // PC specific fields
          typePC: { type: 'string' },
          zoneOperation: { type: 'string' }
        }
      }
    },
    preHandler: [fastify.authenticate, fastify.requireAdmin]
  }, async (request, reply) => {
    try {
      const uniteData = request.body;
      const newUnite = await uniteService.createUnite(uniteData);
      
      reply.code(201);
      return newUnite;
    } catch (error) {
      fastify.log.error(error);
      
      if (error.message && error.message.includes('existe déjà')) {
        reply.code(409);
        return { error: error.message };
      }
      
      reply.code(500);
      return { error: 'Erreur interne du serveur' };
    }
  });

  // Mettre à jour une unité
  fastify.put('/:id', {
    schema: {
      description: 'Mettre à jour une unité',
      tags: ['unites'],
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
          nom: { type: 'string' },
          description: { type: 'string' },
          directeurId: { type: 'integer' },
          // INSTITUT specific fields
          emplacement: { type: 'string' },
          anneeEtude: { type: 'integer' },
          specialite: { type: 'string' },
          // DCT specific fields
          domaine: { type: 'string' },
          niveau: { type: 'string' },
          // PC specific fields
          typePC: { type: 'string' },
          zoneOperation: { type: 'string' }
        }
      }
    },
    preHandler: [fastify.authenticate, fastify.requireAdmin]
  }, async (request, reply) => {
    try {
      const { id } = request.params;
      const uniteData = request.body;
      
      const updatedUnite = await uniteService.updateUnite(id, uniteData);
      
      return updatedUnite;
    } catch (error) {
      fastify.log.error(error);
      
      if (error.message && error.message.includes('n\'existe pas')) {
        reply.code(404);
        return { error: error.message };
      }
      
      reply.code(500);
      return { error: 'Erreur interne du serveur' };
    }
  });

  // Supprimer une unité
  fastify.delete('/:id', {
    schema: {
      description: 'Supprimer une unité',
      tags: ['unites'],
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'string' }
        }
      }
    },
    preHandler: [fastify.authenticate, fastify.requireAdmin]
  }, async (request, reply) => {
    try {
      const { id } = request.params;
      
      await uniteService.deleteUnite(id);
      
      reply.code(204).send();
    } catch (error) {
      fastify.log.error(error);
      
      if (error.message && error.message.includes('n\'existe pas')) {
        reply.code(404);
        return { error: error.message };
      }
      
      if (error.message && error.message.includes('Impossible de supprimer')) {
        reply.code(400);
        return { error: error.message };
      }
      
      reply.code(500);
      return { error: 'Erreur interne du serveur' };
    }
  });
};