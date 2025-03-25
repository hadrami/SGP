const etudiantService = require('../services/etudiantService');

module.exports = async function (fastify, opts) {
  fastify.get('/', async (request, reply) => {
    try {
      return await etudiantService.getEtudiants();
    } catch (error) {
      fastify.log.error(error);
      reply.code(500).send({ error: 'Server error' });
    }
  });

  fastify.get('/:id', async (request, reply) => {
    try {
      const etudiant = await etudiantService.getEtudiantById(request.params.id);
      if (!etudiant) return reply.code(404).send({ error: 'Etudiant not found' });
      return etudiant;
    } catch (error) {
      fastify.log.error(error);
      reply.code(500).send({ error: 'Server error' });
    }
  });

  fastify.post('/', async (request, reply) => {
    try {
      return reply.code(201).send(await etudiantService.createEtudiant(request.body));
    } catch (error) {
      fastify.log.error(error);
      reply.code(500).send({ error: 'Server error' });
    }
  });

  fastify.put('/:id', async (request, reply) => {
    try {
      return await etudiantService.updateEtudiant(request.params.id, request.body);
    } catch (error) {
      fastify.log.error(error);
      reply.code(500).send({ error: 'Server error' });
    }
  });

  fastify.delete('/:id', async (request, reply) => {
    try {
      await etudiantService.deleteEtudiant(request.params.id);
      reply.code(204).send();
    } catch (error) {
      fastify.log.error(error);
      reply.code(500).send({ error: 'Server error' });
    }
  });
};
