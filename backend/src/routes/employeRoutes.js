const employeService = require('../services/employeService');

module.exports = async function (fastify, opts) {
  fastify.get('/', async (request, reply) => {
    try {
      return await employeService.getEmployes();
    } catch (error) {
      fastify.log.error(error);
      reply.code(500).send({ error: 'Server error' });
    }
  });

  fastify.get('/:id', async (request, reply) => {
    try {
      const employe = await employeService.getEmployeById(request.params.id);
      if (!employe) return reply.code(404).send({ error: 'Employé not found' });
      return employe;
    } catch (error) {
      fastify.log.error(error);
      reply.code(500).send({ error: 'Server error' });
    }
  });

  fastify.post('/', async (request, reply) => {
    try {
      return reply.code(201).send(await employeService.createEmploye(request.body));
    } catch (error) {
      fastify.log.error(error);
      reply.code(500).send({ error: 'Server error' });
    }
  });

  fastify.put('/:id', async (request, reply) => {
    try {
      return await employeService.updateEmploye(request.params.id, request.body);
    } catch (error) {
      fastify.log.error(error);
      reply.code(500).send({ error: 'Server error' });
    }
  });

  fastify.delete('/:id', async (request, reply) => {
    try {
      await employeService.deleteEmploye(request.params.id);
      reply.code(204).send();
    } catch (error) {
      fastify.log.error(error);
      reply.code(500).send({ error: 'Server error' });
    }
  });
};
