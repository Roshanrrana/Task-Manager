# Monorepo: only ship the Express API image
FROM node:22-alpine

WORKDIR /app

COPY backend/package.json backend/package-lock.json ./
RUN npm ci --omit=dev

COPY backend/ ./

ENV NODE_ENV=production

# Railway sets PORT at runtime; local default is 5000
CMD ["node", "server.js"]
