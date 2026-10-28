import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from './config';

export interface AuthUser {
  id: string;
  role: string;
  [key: string]: any;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthUser;
}

export const verifyToken = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.header('Authorization');
  if (!authHeader) {
    res.status(401).json({ error: 'Access denied. No token provided.' });
    return;
  }

  const token = authHeader.replace('Bearer ', '');
  try {
    const verified = jwt.verify(token, JWT_SECRET) as { user: AuthUser };
    req.user = verified.user;
    next();
  } catch (err) {
    res.status(400).json({ error: 'Invalid token.' });
  }
};

export const requireRole = (role: string) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user || req.user.role !== role) {
      res.status(403).json({ error: 'Forbidden. Insufficient permissions.' });
      return;
    }
    next();
  };
};

export default { verifyToken, requireRole };
