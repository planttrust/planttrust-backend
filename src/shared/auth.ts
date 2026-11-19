import type { Request, RequestHandler, Response } from 'express';
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

export const SESSION_COOKIE = 'plantrust_session';
const SESSION_MAX_AGE_MS = 8 * 60 * 60 * 1000; // same 8 hours as the token

const cookieOptions = {
  httpOnly: true,
  secure: env.COOKIE_SECURE,
  sameSite: 'lax' as const,
  path: '/',
};

/** M1's login route calls this after checking the password: setSessionCookie(res, signToken(user)). */
export function setSessionCookie(res: Response, token: string) {
  res.cookie(SESSION_COOKIE, token, { ...cookieOptions, maxAge: SESSION_MAX_AGE_MS });
}

/** M1's logout route calls this. */
export function clearSessionCookie(res: Response) {
  res.clearCookie(SESSION_COOKIE, cookieOptions);
}

/** Token from the session cookie (browser), or from an Authorization: Bearer header (Postman, tests, tools). */
function readToken(req: Request): string | undefined {
  const fromCookie: unknown = req.cookies?.[SESSION_COOKIE];
  if (typeof fromCookie === 'string' && fromCookie) return fromCookie;
  const header = req.headers.authorization;
  return header?.startsWith('Bearer ') ? header.slice('Bearer '.length) : undefined;
}

function isAuthUser(value: unknown): value is AuthUser {
  if (typeof value !== 'object' || value === null) return false;
  const v = value as Record<string, unknown>;
  return typeof v.id === 'string' && ROLES.includes(v.role as Role);
}

export const requireAuth: RequestHandler = (req, _res, next) => {
  const token = readToken(req);
  if (!token) {
    next(unauthorized());
    return;
  }
  try {
    const payload = jwt.verify(token, env.JWT_SECRET, {
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
