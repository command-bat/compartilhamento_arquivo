FROM node:22-alpine

WORKDIR /app

# Copia arquivos do backend
COPY backend/package*.json ./

# Instala dependências
RUN npm ci --only=production

# Copia o código do backend
COPY backend/ .

EXPOSE 55092

CMD ["node", "app.js"]
