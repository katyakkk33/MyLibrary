import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { get, run } from '../db';
import { User, PublicUser } from '../models/User';
import { normalizeUserBody, validatePasswordPolicy } from '../utils/userValidator';
import { signToken, AuthPayload } from '../middleware/auth';

function toPublicUser(u: User): PublicUser {
  const { id, login, role, created_at } = u;
  return { id, login, role, created_at };
}

export function register(req: Request, res: Response) {
  const { login, password } = normalizeUserBody(req.body);

  if (!login) {
    return res.status(422).json({ error: 'Login jest wymagany.' });
  }

  const passErr = validatePasswordPolicy(password);
  if (passErr) {
    return res.status(422).json({ error: passErr });
  }

  const existing = get<User>('SELECT * FROM users WHERE login = ?', [login]);
  if (existing) {
    return res.status(409).json({ error: 'Użytkownik z takim loginem już istnieje.' });
  }

  const hash = bcrypt.hashSync(password, 10);

  const info = run(
    'INSERT INTO users (login, password_hash, role) VALUES (?, ?, ?)',
    [login, hash, 'USER']
  );

  const created = get<User>('SELECT * FROM users WHERE id = ?', [info.lastInsertRowid]);
  if (!created) {
    return res.status(500).json({ error: 'Nie udało się utworzyć użytkownika.' });
  }

  const payload: AuthPayload = { id: created.id, login: created.login, role: created.role };
  const token = signToken(payload);

  return res.status(201).json({
    user: toPublicUser(created),
    token
  });
}

export function login(req: Request, res: Response) {
  const { login, password } = normalizeUserBody(req.body);

  if (!login || !password) {
    return res.status(422).json({ error: 'Login i hasło są wymagane.' });
  }

  const user = get<User>('SELECT * FROM users WHERE login = ?', [login]);
  if (!user) {
    return res.status(401).json({ error: 'Nieprawidłowy login lub hasło.' });
  }

  const ok = bcrypt.compareSync(password, user.password_hash);
  if (!ok) {
    return res.status(401).json({ error: 'Nieprawidłowy login lub hasło.' });
  }

  const payload: AuthPayload = { id: user.id, login: user.login, role: user.role };
  const token = signToken(payload);

  return res.json({
    user: toPublicUser(user),
    token
  });
}
