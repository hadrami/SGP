// src/controllers/user.controller.js
"use strict";

const bcrypt = require("bcrypt");

// Récupérer tous les utilisateurs avec pagination et filtres
async function getUsers(request, reply) {
  const { role, instituteId, search, page = 1, limit = 10 } = request.query;
  const skip = (parseInt(page) - 1) * parseInt(limit);

  try {
    // Construire les filtres
    const filters = {};
    if (role) filters.role = role;
    if (instituteId) filters.instituteId = parseInt(instituteId);

    // Recherche par nom/prénom/email
    if (search) {
      filters.OR = [
        { firstName: { contains: search, mode: "insensitive" } },
        { lastName: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ];
    }

    // Récupérer les utilisateurs
    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where: filters,
        skip,
        take: parseInt(limit),
        orderBy: { lastName: "asc" },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          language: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
          institute: {
            select: {
              id: true,
              name: true,
              code: true,
            },
          },
        },
      }),
      this.prisma.user.count({ where: filters }),
    ]);

    return {
      users,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit)),
      },
    };
  } catch (error) {
    request.log.error(error);
    return reply.code(500).send({
      statusCode: 500,
      error: "Internal Server Error",
      message: "Erreur lors de la récupération des utilisateurs",
    });
  }
}

// Récupérer un utilisateur par ID
async function getUserById(request, reply) {
  const { id } = request.params;

  try {
    const user = await this.prisma.user.findUnique({
      where: { id: parseInt(id) },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        language: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        institute: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        military: true,
        civilian: true,
        teacher: true,
        student: true,
      },
    });

    if (!user) {
      return reply.code(404).send({
        statusCode: 404,
        error: "Not Found",
        message: "Utilisateur non trouvé",
      });
    }

    return user;
  } catch (error) {
    request.log.error(error);
    return reply.code(500).send({
      statusCode: 500,
      error: "Internal Server Error",
      message: "Erreur lors de la récupération de l'utilisateur",
    });
  }
}

// Créer un nouvel utilisateur
async function createUser(request, reply) {
  const { email, password, firstName, lastName, role, instituteId, language } =
    request.body;

  try {
    // Vérifier si l'email est déjà utilisé
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return reply.code(409).send({
        statusCode: 409,
        error: "Conflict",
        message: "Cet email est déjà utilisé",
      });
    }

    // Hacher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);

    // Créer l'utilisateur
    const newUser = await this.prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        role: role || "USER",
        language: language || "FRENCH",
        institute: instituteId
          ? {
              connect: { id: parseInt(instituteId) },
            }
          : undefined,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        language: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        institute: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
      },
    });

    return reply.code(201).send(newUser);
  } catch (error) {
    request.log.error(error);
    return reply.code(500).send({
      statusCode: 500,
      error: "Internal Server Error",
      message: "Erreur lors de la création de l'utilisateur",
    });
  }
}

// Mettre à jour un utilisateur
async function updateUser(request, reply) {
  const { id } = request.params;
  const { email, firstName, lastName, role, instituteId, language, isActive } =
    request.body;

  try {
    // Vérifier si l'utilisateur existe
    const existingUser = await this.prisma.user.findUnique({
      where: { id: parseInt(id) },
    });

    if (!existingUser) {
      return reply.code(404).send({
        statusCode: 404,
        error: "Not Found",
        message: "Utilisateur non trouvé",
      });
    }

    // Vérifier si l'email est déjà utilisé par un autre utilisateur
    if (email && email !== existingUser.email) {
      const emailExists = await this.prisma.user.findFirst({
        where: {
          email,
          id: { not: parseInt(id) },
        },
      });

      if (emailExists) {
        return reply.code(409).send({
          statusCode: 409,
          error: "Conflict",
          message: "Cet email est déjà utilisé par un autre utilisateur",
        });
      }
    }

    // Mettre à jour l'utilisateur
    const updatedUser = await this.prisma.user.update({
      where: { id: parseInt(id) },
      data: {
        email,
        firstName,
        lastName,
        role,
        language,
        isActive,
        institute:
          instituteId !== undefined
            ? instituteId === null
              ? { disconnect: true }
              : { connect: { id: parseInt(instituteId) } }
            : undefined,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        language: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        institute: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
      },
    });

    return updatedUser;
  } catch (error) {
    request.log.error(error);
    return reply.code(500).send({
      statusCode: 500,
      error: "Internal Server Error",
      message: "Erreur lors de la mise à jour de l'utilisateur",
    });
  }
}

// Supprimer un utilisateur
async function deleteUser(request, reply) {
  const { id } = request.params;

  try {
    // Vérifier si l'utilisateur existe
    const existingUser = await this.prisma.user.findUnique({
      where: { id: parseInt(id) },
    });

    if (!existingUser) {
      return reply.code(404).send({
        statusCode: 404,
        error: "Not Found",
        message: "Utilisateur non trouvé",
      });
    }

    // Supprimer l'utilisateur
    await this.prisma.user.delete({
      where: { id: parseInt(id) },
    });

    return { message: "Utilisateur supprimé avec succès" };
  } catch (error) {
    request.log.error(error);

    // Si l'erreur est liée à des contraintes de clé étrangère
    if (error.code === "P2003") {
      return reply.code(400).send({
        statusCode: 400,
        error: "Bad Request",
        message:
          "Cet utilisateur ne peut pas être supprimé car il est référencé par d'autres enregistrements",
      });
    }

    return reply.code(500).send({
      statusCode: 500,
      error: "Internal Server Error",
      message: "Erreur lors de la suppression de l'utilisateur",
    });
  }
}

// Changer le mot de passe d'un utilisateur
async function changeUserPassword(request, reply) {
  const { id } = request.params;
  const { newPassword } = request.body;

  try {
    // Vérifier si l'utilisateur existe
    const existingUser = await this.prisma.user.findUnique({
      where: { id: parseInt(id) },
    });

    if (!existingUser) {
      return reply.code(404).send({
        statusCode: 404,
        error: "Not Found",
        message: "Utilisateur non trouvé",
      });
    }

    // Hacher le nouveau mot de passe
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Mettre à jour le mot de passe
    await this.prisma.user.update({
      where: { id: parseInt(id) },
      data: { password: hashedPassword },
    });

    return { message: "Mot de passe changé avec succès" };
  } catch (error) {
    request.log.error(error);
    return reply.code(500).send({
      statusCode: 500,
      error: "Internal Server Error",
      message: "Erreur lors du changement de mot de passe",
    });
  }
}

module.exports = {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  changeUserPassword,
};
