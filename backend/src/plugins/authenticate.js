// src/plugins/authenticate.js
"use strict";

const fp = require("fastify-plugin");


// plugins/authenticate.js
async function authenticate(fastify, opts) {
  fastify.decorate('authenticate', async function(request, reply) {
    try {
      // Get the token from the Authorization header
      const authHeader = request.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new Error('Missing or invalid Authorization header');
      }
      
      // Extract the token
      const token = authHeader.split(' ')[1];
      
      // Verify the token using Fastify JWT
      const decoded = await request.jwtVerify();
      
      // You can also add additional checks here, like checking if the user still exists
      
      // The decoded payload is now available in request.user
    } catch (err) {
      reply.code(401).send({ error: 'Authentication required' });
    }
  });
};
module.exports = fp(authenticate, {
  name: "authenticate",
  fastify: "5.x",
  dependencies: ["@fastify/jwt"],
});
