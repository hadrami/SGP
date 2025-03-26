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
              description: { type: 'string', nullable: true },
              institutId: { type: 'string', nullable: true }
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
      },
      response: {
        200: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            nom: { type: 'string' },
            code: { type: 'string' },
            description: { type: 'string', nullable: true },
            institutId: { type: 'string', nullable: true },
            institut: {
              type: 'object',
              nullable: true,
              properties: {
                id: { type: 'string' },
                nom: { type: 'string' },
                code: { type: 'string' }
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
      },
      response: {
        200: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              nom: { type: 'string' },
              code: { type: 'string' },
              description: { type: 'string', nullable: true },
              uniteId: { type: 'string' }
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
};