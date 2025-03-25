// src/routes/institutRoutes.js
const institutService = require('../services/institutService');

module.exports = async function(fastify, opts) {
  // Récupérer tous les instituts
  fastify.get('/', {
    schema: {
      description: 'Récupérer tous les instituts',
      tags: ['instituts'],
      response: {
        200: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              nom: { type: 'string' },
              code: { type: 'string' },
              emplacement: { type: 'string' },
              description: { type: 'string', nullable: true },
              anneeEtude: { type: 'integer', nullable: true },
              directeur: { 
                type: 'object', 
                nullable: true,
                properties: {
                  id: { type: 'integer' },
                  name: { type: 'string' },
                  identifier: { type: 'string' }
                }
              }
            }
          }
        }
      }
    },
    preHandler: fastify.authenticate
  }, async (request, reply) => {
    try {
      const instituts = await institutService.getAllInstituts();
      return instituts;
    } catch (error) {
      fastify.log.error(error);
      reply.code(500);
      return { error: 'Erreur interne du serveur' };
    }
  });

  // Récupérer un institut par ID
  fastify.get('/:id', {
    schema: {
      description: 'Récupérer un institut par son ID',
      tags: ['instituts'],
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
            emplacement: { type: 'string' },
            description: { type: 'string', nullable: true },
            anneeEtude: { type: 'integer', nullable: true },
            directeur: { 
              type: 'object', 
              nullable: true,
              properties: {
                id: { type: 'integer' },
                name: { type: 'string' },
                identifier: { type: 'string' }
              }
            },
            personnels: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  nom: { type: 'string' },
                  prenom: { type: 'string' },
                  typePersonnel: { type: 'string' }
                }
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
      const institut = await institutService.getInstitutById(id);
      
      if (!institut) {
        reply.code(404);
        return { error: 'Institut non trouvé' };
      }
      
      return institut;
    } catch (error) {
      fastify.log.error(error);
      reply.code(500);
      return { error: 'Erreur interne du serveur' };
    }
  });

  // Créer un nouvel institut
  fastify.post('/', {
    schema: {
      description: 'Créer un nouvel institut',
      tags: ['instituts'],
      body: {
        type: 'object',
        required: ['nom', 'code', 'emplacement'],
        properties: {
          nom: { type: 'string' },
          code: { type: 'string' },
          emplacement: { type: 'string' },
          description: { type: 'string', nullable: true },
          anneeEtude: { type: 'integer', nullable: true },
          directeurId: { type: 'integer', nullable: true }
        }
      },
      response: {
        201: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            nom: { type: 'string' },
            code: { type: 'string' },
            emplacement: { type: 'string' },
            description: { type: 'string', nullable: true },
            anneeEtude: { type: 'integer', nullable: true },
            directeur: { 
              type: 'object', 
              nullable: true,
              properties: {
                id: { type: 'integer' },
                name: { type: 'string' },
                identifier: { type: 'string' }
              }
            }
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
      const nouvelInstitut = await institutService.createInstitut(request.body);
      reply.code(201);
      return nouvelInstitut;
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

  // Mettre à jour un institut
  fastify.put('/:id', {
    schema: {
      description: 'Mettre à jour un institut',
      tags: ['instituts'],
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'string' }
        }
      },
      body: {
        type: 'object',
        required: ['nom', 'emplacement'],
        properties: {
          nom: { type: 'string' },
          emplacement: { type: 'string' },
          description: { type: 'string', nullable: true },
          anneeEtude: { type: 'integer', nullable: true },
          directeurId: { type: 'integer', nullable: true }
        }
      },
      response: {
        200: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            nom: { type: 'string' },
            code: { type: 'string' },
            emplacement: { type: 'string' },
            description: { type: 'string', nullable: true },
            anneeEtude: { type: 'integer', nullable: true },
            directeur: { 
              type: 'object', 
              nullable: true,
              properties: {
                id: { type: 'integer' },
                name: { type: 'string' },
                identifier: { type: 'string' }
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
    preHandler: [fastify.authenticate, fastify.requireAdmin]
  }, async (request, reply) => {
    try {
      const { id } = request.params;
      const institutMisAJour = await institutService.updateInstitut(id, request.body);
      
      return institutMisAJour;
    } catch (error) {
      fastify.log.error(error);
      
      if (error.code === 'P2025') {
        reply.code(404);
        return { error: 'Institut non trouvé' };
      }
      
      reply.code(500);
      return { error: 'Erreur interne du serveur' };
    }
  });

  // Supprimer un institut
  fastify.delete('/:id', {
    schema: {
      description: 'Supprimer un institut',
      tags: ['instituts'],
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
      await institutService.deleteInstitut(id);
      
      return { 
        success: true, 
        message: 'Institut supprimé avec succès' 
      };
    } catch (error) {
      fastify.log.error(error);
      
      if (error.code === 'P2025') {
        reply.code(404);
        return { error: 'Institut non trouvé' };
      }
      
      if (error.message && error.message.includes('Impossible de supprimer')) {
        reply.code(400);
        return { error: error.message };
      }
      
      reply.code(500);
      return { error: 'Erreur interne du serveur' };
    }
  });

  // Récupérer les statistiques d'un institut
  fastify.get('/:id/stats', {
    schema: {
      description: 'Récupérer les statistiques d\'un institut',
      tags: ['instituts'],
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
            stats: {
              type: 'object',
              properties: {
                totalPersonnel: { type: 'integer' },
                militaires: { type: 'integer' },
                professeurs: { type: 'integer' },
                etudiants: { type: 'integer' },
                employes: { type: 'integer' }
              }
            },
            derniereSituation: {
              type: 'object',
              nullable: true,
              properties: {
                id: { type: 'string' },
                dateRapport: { type: 'string', format: 'date-time' },
                militairesPresents: { type: 'integer' },
                civilsPresents: { type: 'integer' },
                professeursPresents: { type: 'integer' },
                etudiantsPresents: { type: 'integer' },
                remarques: { type: 'string', nullable: true }
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
      const stats = await institutService.getInstitutStats(id);
      
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
};