FROM node:20-alpine

WORKDIR /app

# Copy shared utilities first (used by all modules)
COPY shared/ ./shared/

# Copy module-specific files
COPY module-2-marketplace/package*.json ./module-2-marketplace/
RUN cd module-2-marketplace && npm ci --omit=dev

COPY module-2-marketplace/ ./module-2-marketplace/

WORKDIR /app/module-2-marketplace

EXPOSE 3002

HEALTHCHECK --interval=15s --timeout=3s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost:3002/health || exit 1

CMD ["node", "src/server.js"]
