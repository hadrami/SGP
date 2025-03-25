// src/services/userService.js
const { PrismaClient } = require('@prisma/client');
const authService = require('./authService');

const prisma = new PrismaClient();

async function getAllUsers() {
  return await prisma.user.findMany({
    select: {
      id: true,
      identifier: true,
      name: true,
      role: true,
      isFirstLogin: true,
      lastLogin: true,
      createdAt: true,
      updatedAt: true
    }
  });
}

async function getUserById(id) {
  return await prisma.user.findUnique({
    where: { id: parseInt(id) },
    select: {
      id: true,
      identifier: true,
      name: true,
      role: true,
      isFirstLogin: true,
      lastLogin: true,
      createdAt: true,
      updatedAt: true
    }
  });
}

async function getUserByIdentifier(identifier) {
  return await prisma.user.findUnique({
    where: { identifier }
  });
}

async function createUser(userData) {
  const { identifier, name, role } = userData;
  
  // Check if user already exists
  const existingUser = await getUserByIdentifier(identifier);
  if (existingUser) {
    throw new Error('User with this identifier already exists');
  }
  
  // Generate temporary password
  const tempPassword = authService.generateTemporaryPassword();
  
  // Hash the password
  const hashedPassword = await authService.hashPassword(tempPassword);
  
  // Create the user
  const user = await prisma.user.create({
    data: {
      identifier,
      name,
      password: hashedPassword,
      role,
      isFirstLogin: true
    }
  });
  
  // Return user with temporary password (but exclude the hashed password)
  const { password, ...userWithoutPassword } = user;
  return {
    ...userWithoutPassword,
    temporaryPassword: tempPassword
  };
}

async function updateUser(id, userData) {
  const { name, role } = userData;
  
  return await prisma.user.update({
    where: { id: parseInt(id) },
    data: { name, role },
    select: {
      id: true,
      identifier: true,
      name: true,
      role: true,
      isFirstLogin: true,
      lastLogin: true,
      createdAt: true,
      updatedAt: true
    }
  });
}

async function deleteUser(id) {
  return await prisma.user.delete({
    where: { id: parseInt(id) }
  });
}

async function changePassword(identifier, newPassword) {
  // Hash the new password
  const hashedPassword = await authService.hashPassword(newPassword);
  
  // Update the user
  return await prisma.user.update({
    where: { identifier },
    data: {
      password: hashedPassword,
      isFirstLogin: false
    }
  });
}

async function updateLastLogin(id) {
  return await prisma.user.update({
    where: { id },
    data: { lastLogin: new Date() }
  });
}

module.exports = {
  getAllUsers,
  getUserById,
  getUserByIdentifier,
  createUser,
  updateUser,
  deleteUser,
  changePassword,
  updateLastLogin
};