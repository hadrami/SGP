const situationService = require('../services/situationService');

module.exports = async function (fastify, opts) {
  fastify.get('/', async (request, reply) => {
    try {
      return await situationService.getSituations();
    } catch (error) {
      fastify.log.error(error);
      reply.code(500).send({ error: 'Server error' });
    }
  });

  fastify.get('/:id', async (request, reply) => {
    try {
      const situation = await situationService.getSituationById(request.params.id);
      if (!situation) return reply.code(404).send({ error: 'Situation not found' });
      return situation;
    } catch (error) {
      fastify.log.error(error);
      reply.code(500).send({ error: 'Server error' });
    }
  });

  fastify.post('/', async (request, reply) => {
    try {
      return reply.code(201).send(await situationService.createSituation(request.body));
    } catch (error) {
      fastify.log.error(error);
      reply.code(500).send({ error: 'Server error' });
    }
  });

  fastify.put('/:id', async (request, reply) => {
    try {
      return await situationService.updateSituation(request.params.id, request.body);
    } catch (error) {
      fastify.log.error(error);
      reply.code(500).send({ error: 'Server error' });
    }
  });

  fastify.delete('/:id', async (request, reply) => {
    try {
      await situationService.deleteSituation(request.params.id);
      reply.code(204).send();
    } catch (error) {
      fastify.log.error(error);
      reply.code(500).send({ error: 'Server error' });
    }
  });
};
