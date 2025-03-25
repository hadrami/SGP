// src/routes/positionRoutes.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

module.exports = async function(fastify, opts) {
  // Get all positions
  fastify.get('/', {
    schema: {
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: { 
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  titre: { type: 'string' },
                  description: { type: 'string' }
                }
              }
            }
          }
        }
      }
    },
    handler: async (request, reply) => {
      try {
        const positions = await prisma.position.findMany({
          orderBy: {
            titre: 'asc' // Order alphabetically by title
          }
        });
        
        return {
          success: true,
          data: positions
        };
      } catch (error) {
        request.log.error(error);
        reply.code(500);
        return { 
          success: false, 
          error: 'Erreur lors de la récupération des positions' 
        };
      }
    }
  });
  
  // Get position by ID
  fastify.get('/:id', {
    schema: {
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
            success: { type: 'boolean' },
            data: { 
              type: 'object',
              properties: {
                id: { type: 'string' },
                titre: { type: 'string' },
                description: { type: 'string' }
              }
            }
          }
        }
      }
    },
    handler: async (request, reply) => {
      try {
        const { id } = request.params;
        
        const position = await prisma.position.findUnique({
          where: { id }
        });
        
        if (!position) {
          reply.code(404);
          return { 
            success: false, 
            error: `Position avec ID ${id} non trouvée` 
          };
        }
        
        return {
          success: true,
          data: position
        };
      } catch (error) {
        request.log.error(error);
        reply.code(500);
        return { 
          success: false, 
          error: 'Erreur lors de la récupération de la position' 
        };
      }
    }
  });
};