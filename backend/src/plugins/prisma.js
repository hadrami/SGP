// src/plugins/prisma.js
"use strict";

const fp = require("fastify-plugin");
const { PrismaClient } = require("@prisma/client");

// Créer une instance Prisma Client
const prisma = new PrismaClient({
  log: ["query", "info", "warn", "error"],
});

async function prismaPlugin(fastify, options) {
  // Ajouter prisma à l'instance fastify
  fastify.decorate("prisma", prisma);

  // Fermer la connexion prisma quand le serveur se ferme
  fastify.addHook("onClose", async (instance) => {
    await instance.prisma.$disconnect();
  });
}

module.exports = fp(prismaPlugin, {
  name: "prisma",
  fastify: "4.x",
});
