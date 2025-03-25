FROM node:22

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm install

# Ensure nodemon is installed
RUN npm install -g nodemon

COPY . .

CMD ["npm", "run", "dev"]
