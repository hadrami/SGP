const professeurService = require('../services/professeurService');

module.exports = async function (fastify, opts) {
  fastify.get('/', async (request, reply) => {
    try {
      return await professeurService.getProfesseurs();
    } catch (error) {
      fastify.log.error(error);
      reply.code(500).send({ error: 'Server error' });
    }
  });

  fastify.get('/:id', async (request, reply) => {
    try {
      const professeur = await professeurService.getProfesseurById(request.params.id);
      if (!professeur) return reply.code(404).send({ error: 'Professeur not found' });
      return professeur;
    } catch (error) {
      fastify.log.error(error);
      reply.code(500).send({ error: 'Server error' });
    }
  });

  fastify.post('/', async (request, reply) => {
    try {
      return reply.code(201).send(await professeurService.createProfesseur(request.body));
    } catch (error) {
      fastify.log.error(error);
      reply.code(500).send({ error: 'Server error' });
    }
  });

  fastify.put('/:id', async (request, reply) => {
    try {
      return await professeurService.updateProfesseur(request.params.id, request.body);
    } catch (error) {
      fastify.log.error(error);
      reply.code(500).send({ error: 'Server error' });
    }
  });

  fastify.delete('/:id', async (request, reply) => {
    try {
      await professeurService.deleteProfesseur(request.params.id);
      reply.code(204).send();
    } catch (error) {
      fastify.log.error(error);
      reply.code(500).send({ error: 'Server error' });
    }
  });
};
