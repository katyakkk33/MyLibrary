import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export type AuthPayload = {
  id: number;
  login: string;
  role: 'USER' | 'ADMIN';
};

declare global {
  namespace Express {
    interface Request {
      user?: AuthPayload;
    }
  }
}

const JWT_SECRET = (process.env.JWT_SECRET || 'dev-secret-change-this').trim();

export function signToken(payload: AuthPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '2h' });
}

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization || '';
  if (!header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Brak tokenu autoryzacji.' });
  }
  const token = header.slice(7).trim();
  try {
    const payload = jwt.verify(token, JWT_SECRET) as AuthPayload;
    req.user = payload;
    next();
  } catch {
    return res.status(401).json({ error: 'Nieprawidłowy albo wygasły token.' });
  }
}
