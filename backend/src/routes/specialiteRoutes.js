// src/routes/specialiteRoutes.js
const specialiteService = require('../services/specialiteService');

module.exports = async function(fastify, opts) {
  // Récupérer toutes les spécialités
  fastify.get('/', {
    schema: {
      description: 'Récupérer toutes les spécialités',
      tags: ['specialites'],
      response: {
        200: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              nom: { type: 'string' },
              description: { type: 'string', nullable: true },
              armeId: { type: 'string' }
            }
          }
        }
      }
    },
    preHandler: fastify.authenticate
  }, async (request, reply) => {
    try {
      const specialites = await specialiteService.getAllSpecialites();
      return specialites;
    } catch (error) {
      fastify.log.error(error);
      reply.code(500);
      return { error: 'Erreur interne du serveur' };
    }
  });

  // Récupérer une spécialité par ID
  fastify.get('/:id', {
    schema: {
      description: 'Récupérer une spécialité par son ID',
      tags: ['specialites'],
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
            nom: { type: 'string' },
            description: { type: 'string', nullable: true },
            armeId: { type: 'string' },
            arme: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                nom: { type: 'string' }
              }
            }
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
      const specialite = await specialiteService.getSpecialiteById(id);
      
      if (!specialite) {
        reply.code(404);
        return { error: 'Spécialité non trouvée' };
      }
      
      return specialite;
    } catch (error) {
      fastify.log.error(error);
      reply.code(500);
      return { error: 'Erreur interne du serveur' };
    }
  });
};