const documentService = require('../services/documentService');

module.exports = async function (fastify, opts) {
  fastify.get('/', async (request, reply) => {
    try {
      return await documentService.getDocuments();
    } catch (error) {
      fastify.log.error(error);
      reply.code(500).send({ error: 'Server error' });
    }
  });

  fastify.get('/:id', async (request, reply) => {
    try {
      const document = await documentService.getDocumentById(request.params.id);
      if (!document) return reply.code(404).send({ error: 'Document not found' });
      return document;
    } catch (error) {
      fastify.log.error(error);
      reply.code(500).send({ error: 'Server error' });
    }
  });

  fastify.post('/', async (request, reply) => {
    try {
      return reply.code(201).send(await documentService.createDocument(request.body));
    } catch (error) {
      fastify.log.error(error);
      reply.code(500).send({ error: 'Server error' });
    }
  });

  fastify.put('/:id', async (request, reply) => {
    try {
      return await documentService.updateDocument(request.params.id, request.body);
    } catch (error) {
      fastify.log.error(error);
      reply.code(500).send({ error: 'Server error' });
    }
  });

  fastify.delete('/:id', async (request, reply) => {
    try {
      await documentService.deleteDocument(request.params.id);
      reply.code(204).send();
    } catch (error) {
      fastify.log.error(error);
      reply.code(500).send({ error: 'Server error' });
    }
  });
};
