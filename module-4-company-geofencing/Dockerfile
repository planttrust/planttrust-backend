FROM node:20-alpine

WORKDIR /app

# Copy shared utilities first (used by all modules)
COPY shared/ ./shared/

# Copy module-specific files
COPY module-4-company-geofencing/package*.json ./module-4-company-geofencing/
RUN cd module-4-company-geofencing && npm ci --omit=dev

COPY module-4-company-geofencing/ ./module-4-company-geofencing/

WORKDIR /app/module-4-company-geofencing

EXPOSE 3004

HEALTHCHECK --interval=15s --timeout=3s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost:3004/health || exit 1

CMD ["node", "src/server.js"]
