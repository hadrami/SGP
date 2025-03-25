// src/services/authService.js
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const crypto = require('crypto');

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this';

const saltRounds = 10;

async function hashPassword(password) {
  return await bcrypt.hash(password, saltRounds);
}

async function comparePasswords(plainPassword, hashedPassword) {
  return await bcrypt.compare(plainPassword, hashedPassword);
}

function generateToken(user) {
  return jwt.sign(
    { 
      id: user.id, 
      identifier: user.identifier,
      role: user.role 
    },
    JWT_SECRET,
    { expiresIn: '8h' }
  );
}

function generateTemporaryPassword() {
  // Generate a random 8-character password
  return crypto.randomBytes(4).toString('hex');
}

function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

module.exports = {
  hashPassword,
  comparePasswords,
  generateToken,
  generateTemporaryPassword,
  verifyToken
};