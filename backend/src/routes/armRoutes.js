// src/routes/armeRoutes.js
const armeService = require('../services/armeService');

module.exports = async function(fastify, opts) {
  // Récupérer toutes les armes
  fastify.get('/', {
    schema: {
      description: 'Récupérer toutes les armes',
      tags: ['armes'],
      response: {
        200: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              nom: { type: 'string' },
              description: { type: 'string', nullable: true }
            }
          }
        }
      }
    },
    preHandler: fastify.authenticate
  }, async (request, reply) => {
    try {
      const armes = await armeService.getAllArmes();
      return armes;
    } catch (error) {
      fastify.log.error(error);
      reply.code(500);
      return { error: 'Erreur interne du serveur' };
    }
  });

  // Récupérer une arme par ID
  fastify.get('/:id', {
    schema: {
      description: 'Récupérer une arme par son ID',
      tags: ['armes'],
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
      const arme = await armeService.getArmeById(id);
      
      if (!arme) {
        reply.code(404);
        return { error: 'Arme non trouvée' };
      }
      
      return arme;
    } catch (error) {
      fastify.log.error(error);
      reply.code(500);
      return { error: 'Erreur interne du serveur' };
    }
  });

  // Récupérer les spécialités d'une arme
  fastify.get('/:id/specialites', {
    schema: {
      description: 'Récupérer les spécialités d\'une arme',
      tags: ['armes', 'specialites'],
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
              description: { type: 'string', nullable: true },
              armeId: { type: 'string' }
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
      const specialites = await armeService.getSpecialitesByArme(id);
      
      if (!specialites) {
        reply.code(404);
        return { error: 'Arme non trouvée' };
      }
      
      return specialites;
    } catch (error) {
      fastify.log.error(error);
      reply.code(500);
      return { error: 'Erreur interne du serveur' };
    }
  });
};