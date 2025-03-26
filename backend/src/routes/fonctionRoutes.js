// src/routes/fonctionRoutes.js
const fonctionService = require('../services/fonctionService');

module.exports = async function(fastify, opts) {
  // Récupérer toutes les fonctions
  fastify.get('/', {
    schema: {
      description: 'Récupérer toutes les fonctions',
      tags: ['fonctions'],
      response: {
        200: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              titre: { type: 'string' },
              description: { type: 'string', nullable: true }
            }
          }
        }
      }
    },
    preHandler: fastify.authenticate
  }, async (request, reply) => {
    try {
      const fonctions = await fonctionService.getAllFonctions();
      return fonctions;
    } catch (error) {
      fastify.log.error(error);
      reply.code(500);
      return { error: 'Erreur interne du serveur' };
    }
  });

  // Récupérer une fonction par ID
  fastify.get('/:id', {
    schema: {
      description: 'Récupérer une fonction par son ID',
      tags: ['fonctions'],
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'string' }
        }
      },
      response: {
        200: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            titre: { type: 'string' },
            description: { type: 'string', nullable: true }
          }
        },
        404: {
          type: 'object',
          properties: {
            error: { type: 'string' }
          }
        }
      }
    },
    preHandler: fastify.authenticate
  }, async (request, reply) => {
    try {
      const { id } = request.params;
      const fonction = await fonctionService.getFonctionById(id);
      
      if (!fonction) {
        reply.code(404);
        return { error: 'Fonction non trouvée' };
      }
      
      return fonction;
    } catch (error) {
      fastify.log.error(error);
      reply.code(500);
      return { error: 'Erreur interne du serveur' };
    }
  });
};