// src/controllers/auth.controller.js
"use strict";

const bcrypt = require("bcrypt");

async function login(request, reply) {
  const { email, password } = request.body;

  try {
    // Rechercher l'utilisateur par email
    const user = await this.prisma.user.findUnique({
      where: {
        email: email,
      },
      include: {
        institute: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
      },
    });

    // Vérifier si l'utilisateur existe
    if (!user) {
      return reply.code(401).send({
        statusCode: 401,
        error: "Unauthorized",
        message: "Identifiants invalides",
      });
    }

    // Vérifier si l'utilisateur est actif
    if (!user.isActive) {
      return reply.code(401).send({
        statusCode: 401,
        error: "Unauthorized",
        message: "Compte désactivé",
      });
    }

    // Vérifier le mot de passe
    const passwordValid = await bcrypt.compare(password, user.password);
    if (!passwordValid) {
      return reply.code(401).send({
        statusCode: 401,
        error: "Unauthorized",
        message: "Identifiants invalides",
      });
    }

    // Créer le payload du token JWT
    const payload = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      language: user.language,
      instituteId: user.instituteId,
    };

    // Générer le token JWT
    const token = this.jwt.sign(payload);

    // Renvoyer les informations de l'utilisateur et le token
    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        language: user.language,
        institute: user.institute,
      },
      token,
    };
  } catch (error) {
    request.log.error(error);
    return reply.code(500).send({
      statusCode: 500,
      error: "Internal Server Error",
      message: "Erreur lors de l'authentification",
    });
  }
}

async function register(request, reply) {
  const { email, password, firstName, lastName, role, instituteId, language } =
    request.body;

  try {
    // Vérifier si l'email est déjà utilisé
    const existingUser = await this.prisma.user.findUnique({
      where: {
        email: email,
      },
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

    // Créer le nouvel utilisateur
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
              connect: { id: instituteId },
            }
          : undefined,
      },
    });

    // Créer le payload du token JWT
    const payload = {
      id: newUser.id,
      email: newUser.email,
      firstName: newUser.firstName,
      lastName: newUser.lastName,
      role: newUser.role,
      language: newUser.language,
      instituteId: newUser.instituteId,
    };

    // Générer le token JWT
    const token = this.jwt.sign(payload);

    // Renvoyer les informations de l'utilisateur et le token
    return reply.code(201).send({
      user: {
        id: newUser.id,
        email: newUser.email,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        role: newUser.role,
        language: newUser.language,
      },
      token,
    });
  } catch (error) {
    request.log.error(error);
    return reply.code(500).send({
      statusCode: 500,
      error: "Internal Server Error",
      message: "Erreur lors de la création de l'utilisateur",
    });
  }
}

async function forgotPassword(request, reply) {
  const { email } = request.body;

  try {
    // Vérifier si l'utilisateur existe
    const user = await this.prisma.user.findUnique({
      where: {
        email: email,
      },
    });

    if (!user) {
      // Pour des raisons de sécurité, on ne révèle pas si l'email existe ou non
      return reply.send({
        message:
          "Si votre email est associé à un compte, vous recevrez des instructions pour réinitialiser votre mot de passe.",
      });
    }

    // Dans une implémentation réelle, on enverrait un email avec un lien de réinitialisation
    // Pour cet exemple, nous allons simplement générer un token de réinitialisation

    const resetToken = this.jwt.sign(
      { id: user.id, email: user.email, type: "password-reset" },
      { expiresIn: "1h" }
    );

    // Dans une implémentation réelle, on enverrait ce token par email
    // Ici, on le renvoie directement pour tester
    return {
      message:
        "Si votre email est associé à un compte, vous recevrez des instructions pour réinitialiser votre mot de passe.",
      resetToken, // Cela devrait être supprimé en production
    };
  } catch (error) {
    request.log.error(error);
    return reply.code(500).send({
      statusCode: 500,
      error: "Internal Server Error",
      message: "Erreur lors de la demande de réinitialisation du mot de passe",
    });
  }
}

async function resetPassword(request, reply) {
  const { token, newPassword } = request.body;

  try {
    // Vérifier le token
    let decoded;
    try {
      decoded = this.jwt.verify(token);
    } catch (err) {
      return reply.code(400).send({
        statusCode: 400,
        error: "Bad Request",
        message: "Token invalide ou expiré",
      });
    }

    // Vérifier que c'est bien un token de réinitialisation de mot de passe
    if (decoded.type !== "password-reset") {
      return reply.code(400).send({
        statusCode: 400,
        error: "Bad Request",
        message: "Token invalide",
      });
    }

    // Hacher le nouveau mot de passe
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Mettre à jour le mot de passe de l'utilisateur
    await this.prisma.user.update({
      where: {
        id: decoded.id,
      },
      data: {
        password: hashedPassword,
      },
    });

    return {
      message: "Mot de passe réinitialisé avec succès",
    };
  } catch (error) {
    request.log.error(error);
    return reply.code(500).send({
      statusCode: 500,
      error: "Internal Server Error",
      message: "Erreur lors de la réinitialisation du mot de passe",
    });
  }
}

async function verifyToken(request, reply) {
  // Cette route est protégée par le middleware authenticate,
  // donc si on arrive ici, le token est valide
  const user = await this.prisma.user.findUnique({
    where: {
      id: request.user.id,
    },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      role: true,
      language: true,
      isActive: true,
      institute: {
        select: {
          id: true,
          name: true,
          code: true,
        },
      },
    },
  });

  if (!user) {
    return reply.code(404).send({
      statusCode: 404,
      error: "Not Found",
      message: "Utilisateur non trouvé",
    });
  }

  if (!user.isActive) {
    return reply.code(403).send({
      statusCode: 403,
      error: "Forbidden",
      message: "Compte désactivé",
    });
  }

  return {
    user,
  };
}

async function changePassword(request, reply) {
  const { currentPassword, newPassword } = request.body;

  try {
    // Récupérer l'utilisateur
    const user = await this.prisma.user.findUnique({
      where: {
        id: request.user.id,
      },
    });

    if (!user) {
      return reply.code(404).send({
        statusCode: 404,
        error: "Not Found",
        message: "Utilisateur non trouvé",
      });
    }

    // Vérifier le mot de passe actuel
    const passwordValid = await bcrypt.compare(currentPassword, user.password);
    if (!passwordValid) {
      return reply.code(400).send({
        statusCode: 400,
        error: "Bad Request",
        message: "Mot de passe actuel incorrect",
      });
    }

    // Hacher le nouveau mot de passe
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Mettre à jour le mot de passe
    await this.prisma.user.update({
      where: {
        id: request.user.id,
      },
      data: {
        password: hashedPassword,
      },
    });

    return {
      message: "Mot de passe changé avec succès",
    };
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
  login,
  register,
  forgotPassword,
  resetPassword,
  verifyToken,
  changePassword,
};
