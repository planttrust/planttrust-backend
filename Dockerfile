FROM node:20-alpine

WORKDIR /app

# Copy dependency manifests and install
COPY package*.json ./
RUN npm ci --omit=dev

# Copy application source
COPY server.js ./
COPY src/ ./src/

EXPOSE 3000

HEALTHCHECK --interval=15s --timeout=3s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost:3000/health || exit 1

CMD ["node", "server.js"]
