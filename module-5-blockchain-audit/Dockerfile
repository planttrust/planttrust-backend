FROM node:20-alpine

WORKDIR /app

# Copy shared utilities first (used by all modules)
COPY shared/ ./shared/

# Copy module-specific files
COPY module-5-blockchain-audit/package*.json ./module-5-blockchain-audit/
RUN cd module-5-blockchain-audit && npm ci --omit=dev

COPY module-5-blockchain-audit/ ./module-5-blockchain-audit/

# Let shared/ resolve packages from the module's node_modules
RUN ln -s /app/module-5-blockchain-audit/node_modules /app/shared/node_modules

WORKDIR /app/module-5-blockchain-audit

EXPOSE 3005

HEALTHCHECK --interval=15s --timeout=3s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost:3005/health || exit 1

CMD ["node", "src/server.js"]
