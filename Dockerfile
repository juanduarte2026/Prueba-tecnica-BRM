FROM node:18-alpine

WORKDIR /app

# Copiar solo archivos de package primero
COPY package*.json ./

# Instalar dependencias
RUN npm install

# Copiar solo lo necesario
COPY app/ ./app/
COPY doc/ ./doc/
COPY apidoc.json ./

EXPOSE 3000

CMD ["node", "app/app.js"]