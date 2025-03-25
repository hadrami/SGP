// src/routes/authRoutes.js
const authService = require('../services/authService');
const userService = require('../services/userService');

module.exports = async function(fastify, opts) {
  // Login route
  fastify.post('/login', async (request, reply) => {
    try {
      const { identifier, password } = request.body;
      
      // Find the user
      const user = await userService.getUserByIdentifier(identifier);
      if (!user) {
        reply.code(401);
        return { error: 'Invalid credentials' };
      }
      
      // Verify password
      const passwordMatch = await authService.comparePasswords(password, user.password);
      if (!passwordMatch) {
        reply.code(401);
        return { error: 'Invalid credentials' };
      }
      
      // Update last login time
      await userService.updateLastLogin(user.id);
      
      // Generate JWT
      const token = authService.generateToken(user);
      
      // Remove password from response
      const { password: _, ...userWithoutPassword } = user;
      
      // Check if first login
      if (user.isFirstLogin) {
        return {
          user: userWithoutPassword,
          token,
          requirePasswordChange: true
        };
      }
      
      // Return user and token
      return {
        user: userWithoutPassword,
        token
      };
    } catch (error) {
      fastify.log.error(error);
      reply.code(500);
      return { error: 'Server error' };
    }
  });
  
// Change password route
fastify.post('/change-password', {
  schema: {
    body: {
      type: 'object',
      required: ['identifier', 'currentPassword', 'newPassword'],
      properties: {
        identifier: { type: 'string' },
        currentPassword: { type: 'string' },
        newPassword: { type: 'string', minLength: 6 }
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
      401: {
        type: 'object',
        properties: {
          error: { type: 'string' }
        }
      }
    }
  },
  handler: async (request, reply) => {
    try {
      const { identifier, currentPassword, newPassword } = request.body;
      
      // Validate inputs
      if (!identifier || !currentPassword || !newPassword) {
        reply.code(400);
        return { error: 'Tous les champs sont obligatoires' };
      }
      
      if (newPassword.length < 6) {
        reply.code(400);
        return { error: 'Le nouveau mot de passe doit contenir au moins 6 caractères' };
      }
      
      // Find the user
      const user = await fastify.prisma.user.findUnique({
        where: { identifier }
      });
      
      if (!user) {
        reply.code(401);
        return { error: 'Utilisateur non trouvé' };
      }
      
      // Verify current password
      const passwordMatch = await fastify.authService.comparePasswords(
        currentPassword, 
        user.password
      );
      
      if (!passwordMatch) {
        reply.code(401);
        return { error: 'Mot de passe actuel incorrect' };
      }
      
      // Hash new password
      const hashedPassword = await fastify.authService.hashPassword(newPassword);
      
      // Update user password and set isFirstLogin to false
      await fastify.prisma.user.update({
        where: { identifier },
        data: { 
          password: hashedPassword,
          isFirstLogin: false
        }
      });
      
      return { 
        success: true, 
        message: 'Mot de passe modifié avec succès' 
      };
    } catch (error) {
      fastify.log.error(error);
      reply.code(500);
      return { error: 'Erreur serveur lors du changement de mot de passe' };
    }
  }
});

  // Verify token route (useful for checking if token is still valid)
  fastify.get('/verify-token', async (request, reply) => {
    try {
      const token = request.headers.authorization?.split(' ')[1];
      
      if (!token) {
        reply.code(401);
        return { error: 'No token provided' };
      }
      
      const decoded = authService.verifyToken(token);
      if (!decoded) {
        reply.code(401);
        return { error: 'Invalid or expired token' };
      }
      
      return { valid: true, user: decoded };
    } catch (error) {
      fastify.log.error(error);
      reply.code(500);
      return { error: 'Server error' };
    }
  });
};