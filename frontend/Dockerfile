FROM node:22-alpine

WORKDIR /app

# Initialiser un projet Vite avec React
RUN npm create vite@latest . -- --template react

# Installer les dépendances
RUN npm install
RUN npm install axios i18next i18next-browser-languagedetector i18next-http-backend react-i18next react-redux react-router-dom @reduxjs/toolkit jwt-decode @heroicons/react react-hook-form
RUN npm install -D tailwindcss@3.4.1 autoprefixer

# Configuration minimale de Tailwind
RUN npx tailwindcss init

# Exposer le port
EXPOSE 5174

# Commande pour démarrer l'application en mode développement
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]