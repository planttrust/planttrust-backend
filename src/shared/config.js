require('dotenv').config();

const isProd = process.env.NODE_ENV === 'production';
const INSECURE_DEFAULTS = [
  'dev-secret-change-in-prod',
  'change-this-to-a-random-secret',
  'your-secret-here',
  'ci-test-secret',
  'secret'
];

if (isProd && (!process.env.JWT_SECRET || INSECURE_DEFAULTS.includes(process.env.JWT_SECRET))) {
  throw new Error('FATAL: JWT_SECRET environment variable must be explicitly configured in production.');
}

module.exports = {
  PORT: process.env.PORT || 3000,
  DATABASE_URL: process.env.DATABASE_URL || 'postgres://planttrust:planttrust_dev@localhost:5432/planttrust',
  REDIS_URL: process.env.REDIS_URL || 'redis://localhost:6379',
  JWT_SECRET: process.env.JWT_SECRET || 'dev-secret-change-in-prod',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '1h',
  XRPL_NETWORK: process.env.XRPL_NETWORK || 'wss://s.altnet.rippletest.net:51233',
  XRPL_WALLET_SEED: process.env.XRPL_WALLET_SEED || '',
  NODE_ENV: process.env.NODE_ENV || 'development',
};