// src/routes/userRoutes.js
const userService = require('../services/userService');

module.exports = async function(fastify, opts) {
  // Authentication middleware for protecting routes
  const authenticate = async (request, reply) => {
    try {
      const token = request.headers.authorization?.split(' ')[1];
      
      if (!token) {
        reply.code(401);
        return reply.send({ error: 'Authentication required' });
      }
      
      const decoded = fastify.authService.verifyToken(token);
      if (!decoded) {
        reply.code(401);
        return reply.send({ error: 'Invalid or expired token' });
      }
      
      // Only allow admin users to access user management routes
      if (decoded.role !== 'ADMIN') {
        reply.code(403);
        return reply.send({ error: 'Access denied' });
      }
      
      request.user = decoded;
    } catch (error) {
      reply.code(401);
      return reply.send({ error: 'Authentication required' });
    }
  };
  
  // Get all users (admin only)
  fastify.get('/', { preHandler: authenticate }, async (request, reply) => {
    try {
      const users = await userService.getAllUsers();
      return users;
    } catch (error) {
      fastify.log.error(error);
      reply.code(500);
      return { error: 'Server error' };
    }
  });
  
  // Get user by ID (admin only)
  fastify.get('/:id', { preHandler: authenticate }, async (request, reply) => {
    try {
      const { id } = request.params;
      const user = await userService.getUserById(id);
      
      if (!user) {
        reply.code(404);
        return { error: 'User not found' };
      }
      
      return user;
    } catch (error) {
      fastify.log.error(error);
      reply.code(500);
      return { error: 'Server error' };
    }
  });
  
  // Create user (admin only)
  fastify.post('/', { preHandler: authenticate }, async (request, reply) => {
    try {
      const { identifier, name, role } = request.body;
      
      // Validate input
      if (!identifier || !name || !role) {
        reply.code(400);
        return { error: 'All fields are required' };
      }
      
      // Create user
      const newUser = await userService.createUser({ identifier, name, role });
      
      return newUser;
    } catch (error) {
      fastify.log.error(error);
      
      if (error.message === 'User with this identifier already exists') {
        reply.code(409);
        return { error: error.message };
      }
      
      reply.code(500);
      return { error: 'Server error' };
    }
  });
  
  // Update user (admin only)
  fastify.put('/:id', { preHandler: authenticate }, async (request, reply) => {
    try {
      const { id } = request.params;
      const { name, role } = request.body;
      
      // Validate input
      if (!name || !role) {
        reply.code(400);
        return { error: 'All fields are required' };
      }
      
      // Update user
      const updatedUser = await userService.updateUser(id, { name, role });
      
      return updatedUser;
    } catch (error) {
      fastify.log.error(error);
      
      if (error.code === 'P2025') {
        reply.code(404);
        return { error: 'User not found' };
      }
      
      reply.code(500);
      return { error: 'Server error' };
    }
  });
  
  // Delete user (admin only)
  fastify.delete('/:id', { preHandler: authenticate }, async (request, reply) => {
    try {
      const { id } = request.params;
      
      await userService.deleteUser(id);
      
      return { success: true, message: 'User deleted successfully' };
    } catch (error) {
      fastify.log.error(error);
      
      if (error.code === 'P2025') {
        reply.code(404);
        return { error: 'User not found' };
      }
      
      reply.code(500);
      return { error: 'Server error' };
    }
  });
  
  // Reset user password (admin only)
  fastify.post('/:id/reset-password', { preHandler: authenticate }, async (request, reply) => {
    try {
      const { id } = request.params;
      
      // Get user
      const user = await userService.getUserById(id);
      if (!user) {
        reply.code(404);
        return { error: 'User not found' };
      }
      
      // Generate new temp password
      const tempPassword = fastify.authService.generateTemporaryPassword();
      
      // Update user
      await userService.changePassword(user.identifier, tempPassword);
      
      // Set user back to first login state
      await prisma.user.update({
        where: { id: parseInt(id) },
        data: { isFirstLogin: true }
      });
      
      return { 
        success: true, 
        message: 'Password reset successfully', 
        temporaryPassword: tempPassword 
      };
    } catch (error) {
      fastify.log.error(error);
      reply.code(500);
      return { error: 'Server error' };
    }
  });
};