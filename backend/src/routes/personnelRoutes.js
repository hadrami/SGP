const militaireService = require('../services/militaireService');
const professeurService = require('../services/professeurService');
const employeService = require('../services/employeService');

module.exports = async function (fastify, opts) {
  // 🔹 Militaires Routes
  fastify.get('/militaires', async (request, reply) => {
    try {
      return await militaireService.getMilitaires();
    } catch (error) {
      fastify.log.error(error);
      reply.code(500).send({ error: 'Server error' });
    }
  });

  fastify.get('/militaires/:id', async (request, reply) => {
    try {
      const militaire = await militaireService.getMilitaireById(request.params.id);
      if (!militaire) return reply.code(404).send({ error: 'Militaire not found' });
      return militaire;
    } catch (error) {
      fastify.log.error(error);
      reply.code(500).send({ error: 'Server error' });
    }
  });

  fastify.post('/militaires', async (request, reply) => {
    try {
      return reply.code(201).send(await militaireService.createMilitaire(request.body));
    } catch (error) {
      fastify.log.error(error);
      reply.code(500).send({ error: 'Server error' });
    }
  });

  fastify.put('/militaires/:id', async (request, reply) => {
    try {
      return await militaireService.updateMilitaire(request.params.id, request.body);
    } catch (error) {
      fastify.log.error(error);
      reply.code(500).send({ error: 'Server error' });
    }
  });

  fastify.delete('/militaires/:id', async (request, reply) => {
    try {
      await militaireService.deleteMilitaire(request.params.id);
      reply.code(204).send();
    } catch (error) {
      fastify.log.error(error);
      reply.code(500).send({ error: 'Server error' });
    }
  });

  // 🔹 Professeurs Routes
  fastify.get('/professeurs', async (request, reply) => {
    try {
      return await professeurService.getProfesseurs();
    } catch (error) {
      fastify.log.error(error);
      reply.code(500).send({ error: 'Server error' });
    }
  });

  fastify.get('/professeurs/:id', async (request, reply) => {
    try {
      const professeur = await professeurService.getProfesseurById(request.params.id);
      if (!professeur) return reply.code(404).send({ error: 'Professeur not found' });
      return professeur;
    } catch (error) {
      fastify.log.error(error);
      reply.code(500).send({ error: 'Server error' });
    }
  });

  fastify.post('/professeurs', async (request, reply) => {
    try {
      return reply.code(201).send(await professeurService.createProfesseur(request.body));
    } catch (error) {
      fastify.log.error(error);
      reply.code(500).send({ error: 'Server error' });
    }
  });

  fastify.put('/professeurs/:id', async (request, reply) => {
    try {
      return await professeurService.updateProfesseur(request.params.id, request.body);
    } catch (error) {
      fastify.log.error(error);
      reply.code(500).send({ error: 'Server error' });
    }
  });

  fastify.delete('/professeurs/:id', async (request, reply) => {
    try {
      await professeurService.deleteProfesseur(request.params.id);
      reply.code(204).send();
    } catch (error) {
      fastify.log.error(error);
      reply.code(500).send({ error: 'Server error' });
    }
  });

  // 🔹 Employés Routes
  fastify.get('/employes', async (request, reply) => {
    try {
      return await employeService.getEmployes();
    } catch (error) {
      fastify.log.error(error);
      reply.code(500).send({ error: 'Server error' });
    }
  });

  fastify.get('/employes/:id', async (request, reply) => {
    try {
      const employe = await employeService.getEmployeById(request.params.id);
      if (!employe) return reply.code(404).send({ error: 'Employé not found' });
      return employe;
    } catch (error) {
      fastify.log.error(error);
      reply.code(500).send({ error: 'Server error' });
    }
  });

  fastify.post('/employes', async (request, reply) => {
    try {
      return reply.code(201).send(await employeService.createEmploye(request.body));
    } catch (error) {
      fastify.log.error(error);
      reply.code(500).send({ error: 'Server error' });
    }
  });

  fastify.put('/employes/:id', async (request, reply) => {
    try {
      return await employeService.updateEmploye(request.params.id, request.body);
    } catch (error) {
      fastify.log.error(error);
      reply.code(500).send({ error: 'Server error' });
    }
  });

  fastify.delete('/employes/:id', async (request, reply) => {
    try {
      await employeService.deleteEmploye(request.params.id);
      reply.code(204).send();
    } catch (error) {
      fastify.log.error(error);
      reply.code(500).send({ error: 'Server error' });
    }
  });
};
