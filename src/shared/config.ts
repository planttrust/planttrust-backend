import dotenv from 'dotenv';
dotenv.config();

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

export const PORT = Number(process.env.PORT) || 3000;
export const DATABASE_URL = process.env.DATABASE_URL || 'postgres://planttrust:planttrust_dev@localhost:5432/planttrust';
export const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';
export const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-in-prod';
export const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1h';
export const XRPL_NETWORK = process.env.XRPL_NETWORK || 'wss://s.altnet.rippletest.net:51233';
export const XRPL_WALLET_SEED = process.env.XRPL_WALLET_SEED || '';
export const NODE_ENV = process.env.NODE_ENV || 'development';

export default {
  PORT,
  DATABASE_URL,
  REDIS_URL,
  JWT_SECRET,
  JWT_EXPIRES_IN,
  XRPL_NETWORK,
  XRPL_WALLET_SEED,
  NODE_ENV,
};
