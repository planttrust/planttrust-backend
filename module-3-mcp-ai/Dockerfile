FROM node:20-alpine

WORKDIR /app

# Copy shared utilities first (used by all modules)
COPY shared/ ./shared/

# Copy module-specific files
COPY module-3-mcp-ai/package*.json ./module-3-mcp-ai/
RUN cd module-3-mcp-ai && npm ci --omit=dev

COPY module-3-mcp-ai/ ./module-3-mcp-ai/

# Let shared/ resolve packages from the module's node_modules
RUN ln -s /app/module-3-mcp-ai/node_modules /app/shared/node_modules

WORKDIR /app/module-3-mcp-ai

EXPOSE 3003

HEALTHCHECK --interval=15s --timeout=3s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost:3003/health || exit 1

CMD ["node", "src/server.js"]
