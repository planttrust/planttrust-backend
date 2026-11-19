import type { RequestHandler } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { forbidden, unauthorized } from './errors';

export const ROLES = ['investor', 'company', 'admin', 'regulator'] as const;
export type Role = (typeof ROLES)[number];

export interface AuthUser {
  id: string;
  role: Role;
}

const TOKEN_LIFETIME = '8h';

export function signToken(user: AuthUser): string {
  return jwt.sign({ id: user.id, role: user.role }, env.JWT_SECRET, {
    algorithm: 'HS256',
    expiresIn: TOKEN_LIFETIME,
  });
}

function isAuthUser(value: unknown): value is AuthUser {
  if (typeof value !== 'object' || value === null) return false;
  const v = value as Record<string, unknown>;
  return typeof v.id === 'string' && ROLES.includes(v.role as Role);
}

export const requireAuth: RequestHandler = (req, _res, next) => {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    next(unauthorized());
    return;
  }
  try {
    const payload = jwt.verify(header.slice('Bearer '.length), env.JWT_SECRET, {
      algorithms: ['HS256'],
    });
    if (!isAuthUser(payload)) {
      next(unauthorized('Invalid token'));
      return;
    }
    req.user = { id: payload.id, role: payload.role };
    next();
  } catch {
    next(unauthorized('Invalid or expired token'));
  }
};

export function requireRole(...roles: Role[]): RequestHandler {
  return (req, _res, next) => {
    if (!req.user) {
      next(unauthorized());
      return;
    }
    if (!roles.includes(req.user.role)) {
      next(forbidden());
      return;
    }
    next();
  };
}
