FROM node:20-alpine

WORKDIR /app

# Copy shared utilities first (used by all modules)
COPY shared/ ./shared/

# Copy module-specific files
COPY module-1-user-management/package*.json ./module-1-user-management/
RUN cd module-1-user-management && npm ci --omit=dev

COPY module-1-user-management/ ./module-1-user-management/

WORKDIR /app/module-1-user-management

EXPOSE 3001

HEALTHCHECK --interval=15s --timeout=3s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost:3001/health || exit 1

CMD ["node", "src/server.js"]
