import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
    env: {
      NODE_ENV: 'test',
      JWT_SECRET: 'test-secret-not-used-anywhere-else',
      DATABASE_URL: 'postgresql://planttrust:planttrust@localhost:5433/planttrust_test',
      CORS_ORIGIN: 'http://localhost:3000',
    },
    restoreMocks: true,
  },
});
