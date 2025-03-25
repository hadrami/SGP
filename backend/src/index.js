// src/index.js
const fastify = require('fastify')({ logger: true });
const path = require('path');
require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const fastifyJwt = require('@fastify/jwt');
const fastifyMultipart = require('@fastify/multipart');
const cors = require('@fastify/cors');

const fs = require('fs');

// Initialize Prisma
const prisma = new PrismaClient();

// Import services
const authService = require('./services/authService');
const documentService = require('./services/documentService');

// Add services to fastify instance
fastify.decorate('authService', authService);
fastify.decorate('prisma', prisma);
fastify.decorate('documentService', documentService);

// Register plugins

// Register CORS middleware
fastify.register(cors, {
  origin: '*', // Allow all origins (For development/testing only)
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
});

// Register JWT
fastify.register(fastifyJwt, {
  secret: process.env.JWT_SECRET,
  sign: {
    expiresIn: '1h' // Token expires in 1 hour
  },
  verify: {
    // Additional verification options
    // ignoreExpiration: false // Default, will check expiration
  }
});

// Configuration pour le téléchargement de fichiers
fastify.register(fastifyMultipart, {
  limits: {
    fieldNameSize: 100, // Max field name size in bytes
    fieldSize: 100, // Max field value size in bytes
    fields: 10, // Max number of non-file fields
    fileSize: 10 * 1024 * 1024, // 10MB max file size
    files: 5, // Max number of file fields
    headerPairs: 2000 // Max number of header key=>value pairs
  },
  attachFieldsToBody: true
});

// Créer le dossier uploads s'il n'existe pas
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Servir les fichiers statiques
fastify.register(require('@fastify/static'), {
  root: path.join(__dirname, 'uploads'),
  prefix: '/uploads/'
});

fastify.register(require('@fastify/swagger'), {
  routePrefix: '/documentation',
  swagger: {
    info: {
      title: 'SGP API Documentation',
      description: 'API documentation pour le Système de Gestion du Personnel Militaire et Civil',
      version: '1.0.0'
    },
    host: 'localhost:3000',
    schemes: ['http'],
    consumes: ['application/json'],
    produces: ['application/json'],
    securityDefinitions: {
      bearerAuth: {
        type: 'apiKey',
        name: 'Authorization',
        in: 'header'
      }
    }
  },
  exposeRoute: true
});

// Middleware d'authentification
fastify.decorate('authenticate', async (request, reply) => {
  try {
    await request.jwtVerify();
  } catch (err) {
    reply.code(401).send({
      statusCode: 401,
      error: 'Non autorisé',
      message: 'Authentification requise'
    });
  }
});

// Middleware pour vérifier les rôles administrateur
fastify.decorate('requireAdmin', async (request, reply) => {
  if (request.user && request.user.role !== 'ADMIN') {
    return reply.code(403).send({
      statusCode: 403,
      error: 'Accès refusé',
      message: 'Privilèges d\'administrateur requis'
    });
  }
});

// Health check route
fastify.get('/health', async () => {
  return { status: 'OK', timestamp: new Date().toISOString() };
});

// Register routes
fastify.register(require('./routes/authRoutes'), { prefix: '/api/auth' });
fastify.register(require('./routes/userRoutes'), { prefix: '/api/users' });
fastify.register(require('./routes/institutRoutes'), { prefix: '/api/instituts' });
fastify.register(require('./routes/personnelRoutes'), { prefix: '/api/personnels' });
fastify.register(require('./routes/militaireRoutes'), { prefix: '/api/militaires' });
fastify.register(require('./routes/professeurRoutes'), { prefix: '/api/professeurs' });
fastify.register(require('./routes/etudiantRoutes'), { prefix: '/api/etudiants' });
fastify.register(require('./routes/employeRoutes'), { prefix: '/api/employes' });
fastify.register(require('./routes/documentRoutes'), { prefix: '/api/documents' });
fastify.register(require('./routes/situationRoutes'), { prefix: '/api/situations' });
fastify.register(require('./routes/positionRoutes'), { prefix: '/api/positions' });

// Error handler global
fastify.setErrorHandler((error, request, reply) => {
  fastify.log.error(error);
  
  // Erreurs de validation
  if (error.validation) {
    return reply.code(400).send({
      statusCode: 400,
      error: 'Erreur de validation',
      message: error.message
    });
  }
  
  // Erreurs JWT
  if (error.code === 'FST_JWT_NO_AUTHORIZATION_IN_HEADER') {
    return reply.code(401).send({
      statusCode: 401,
      error: 'Non autorisé',
      message: 'Authentification requise'
    });
  }
  
  // Erreurs Prisma
  if (error.code && error.code.startsWith('P')) {
    // Erreur d'enregistrement unique
    if (error.code === 'P2002') {
      return reply.code(409).send({
        statusCode: 409,
        error: 'Conflit',
        message: `L'enregistrement avec cette valeur (${error.meta?.target.join(', ')}) existe déjà`
      });
    }
    
    // Enregistrement non trouvé
    if (error.code === 'P2025') {
      return reply.code(404).send({
        statusCode: 404,
        error: 'Non trouvé',
        message: 'L\'enregistrement demandé n\'existe pas'
      });
    }
  }
  
  // Erreur par défaut
  reply.code(500).send({
    statusCode: 500,
    error: 'Erreur interne du serveur',
    message: 'Une erreur est survenue, veuillez réessayer plus tard'
  });
});

// Handle cleanup on shutdown
const closeGracefully = async (signal) => {
  fastify.log.info(`Signal de terminaison reçu: ${signal}`);

  await fastify.close();
  await prisma.$disconnect();
  process.exit(0);
};

process.on('SIGINT', closeGracefully);
process.on('SIGTERM', closeGracefully);

// Start the server
const start = async () => {
  try {
    const port = process.env.PORT || 3000;
    const host = process.env.HOST || '0.0.0.0';
    
    await fastify.listen({ port, host });
    fastify.log.info(`Serveur démarré sur ${host}:${port}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

// Exporter le serveur pour les tests
module.exports = { app: fastify, start };

// Démarrer le serveur si appelé directement
if (require.main === module) {
  start();
}