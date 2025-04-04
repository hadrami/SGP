// src/routes/sousUniteRoutes.js
const sousUniteService = require('../services/sousUniteSerivce');

module.exports = async function(fastify, opts) {
  // Récupérer toutes les sous-unités
  fastify.get('/', {
    schema: {
      description: 'Récupérer toutes les sous-unités',
      tags: ['sous-unites'],
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
        }
      }
    },
    preHandler: fastify.authenticate
  }, async (request, reply) => {
    try {
      const sousUnites = await sousUniteService.getAllSousUnites();
      return sousUnites;
    } catch (error) {
      fastify.log.error(error);
      reply.code(500);
      return { error: 'Erreur interne du serveur' };
    }
  });

  // Récupérer une sous-unité par ID
  fastify.get('/:id', {
    schema: {
      description: 'Récupérer une sous-unité par son ID',
      tags: ['sous-unites'],
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
            uniteId: { type: 'string' },
            unite: {
              type: 'object',
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
      const sousUnite = await sousUniteService.getSousUniteById(id);
      
      if (!sousUnite) {
        reply.code(404);
        return { error: 'Sous-unité non trouvée' };
      }
      
      return sousUnite;
    } catch (error) {
      fastify.log.error(error);
      reply.code(500);
      return { error: 'Erreur interne du serveur' };
    }
  });
  
  // Récupérer les militaires d'une sous-unité
  fastify.get('/:id/militaires', {
    schema: {
      description: 'Récupérer les militaires d\'une sous-unité',
      tags: ['sous-unites', 'militaires'],
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'string' }
        }
      },
      querystring: {
        type: 'object',
        properties: {
          page: { type: 'integer', default: 1 },
          limit: { type: 'integer', default: 10 }
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
                properties: {
                  id: { type: 'string' },
                  matricule: { type: 'string' },
                  grade: { type: 'string' },
                  categorie: { type: 'string' },
                  personnel: {
                    type: 'object',
                    properties: {
                      nom: { type: 'string' },
                      prenom: { type: 'string' }
                    }
                  }
                }
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
      const { page = 1, limit = 10 } = request.query;
      
      const result = await sousUniteService.getMilitairesBySousUnite(id, page, limit);
      
      return result;
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

  // Créer une nouvelle sous-unité (accessible uniquement aux admins)
  fastify.post('/', {
    schema: {
      description: 'Créer une nouvelle sous-unité',
      tags: ['sous-unites'],
      body: {
        type: 'object',
        required: ['nom', 'code', 'uniteId'],
        properties: {
          nom: { type: 'string' },
          code: { type: 'string' },
          description: { type: 'string', nullable: true },
          uniteId: { type: 'string' }
        }
      },
      response: {
        201: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            nom: { type: 'string' },
            code: { type: 'string' },
            description: { type: 'string', nullable: true },
            uniteId: { type: 'string' }
          }
        },
        409: {
          type: 'object',
          properties: {
            error: { type: 'string' }
          }
        }
      }
    },
    preHandler: [fastify.authenticate, fastify.requireAdmin]
  }, async (request, reply) => {
    try {
      const sousUniteData = request.body;
      const nouvelleSousUnite = await sousUniteService.createSousUnite(sousUniteData);
      
      reply.code(201);
      return nouvelleSousUnite;
    } catch (error) {
      fastify.log.error(error);
      
      if (error.message && error.message.includes('existe déjà')) {
        reply.code(409);
        return { error: error.message };
      }
      
      if (error.message && error.message.includes('n\'existe pas')) {
        reply.code(404);
        return { error: error.message };
      }
      
      reply.code(500);
      return { error: 'Erreur interne du serveur' };
    }
  });

  // Mettre à jour une sous-unité (accessible uniquement aux admins)
  fastify.put('/:id', {
    schema: {
      description: 'Mettre à jour une sous-unité',
      tags: ['sous-unites'],
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'string' }
        }
      },
      body: {
        type: 'object',
        required: ['nom'],
        properties: {
          nom: { type: 'string' },
          description: { type: 'string', nullable: true },
          uniteId: { type: 'string' }
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
            uniteId: { type: 'string' }
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
    preHandler: [fastify.authenticate, fastify.requireAdmin]
  }, async (request, reply) => {
    try {
      const { id } = request.params;
      const sousUniteData = request.body;
      
      const sousUniteMisAJour = await sousUniteService.updateSousUnite(id, sousUniteData);
      
      return sousUniteMisAJour;
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

  // Supprimer une sous-unité (accessible uniquement aux admins)
  fastify.delete('/:id', {
    schema: {
      description: 'Supprimer une sous-unité',
      tags: ['sous-unites'],
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
            message: { type: 'string' }
          }
        },
        404: {
          type: 'object',
          properties: {
            error: { type: 'string' }
          }
        },
        400: {
          type: 'object',
          properties: {
            error: { type: 'string' }
          }
        }
      }
    },
    preHandler: [fastify.authenticate, fastify.requireAdmin]
  }, async (request, reply) => {
    try {
      const { id } = request.params;
      
      await sousUniteService.deleteSousUnite(id);
      
      return {
        success: true,
        message: 'Sous-unité supprimée avec succès'
      };
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