import { NewUserPayload } from '../models/User';

export function normalizeLogin(raw: unknown): string {
  return String(raw ?? '').trim();
}

// Політика пароля: мін. 6 символів, хоча б одна літера і одна цифра
export function validatePasswordPolicy(password: string): string | null {
  const pwd = String(password ?? '');

  if (!pwd || pwd.length < 6) {
    return 'Hasło musi mieć co najmniej 6 znaków.';
  }
  if (!/[A-Za-z]/.test(pwd) || !/[0-9]/.test(pwd)) {
    return 'Hasło musi zawierać przynajmniej jedną literę i jedną cyfrę.';
  }
  return null;
}

export function normalizeUserBody(body: any): NewUserPayload {
  const login = normalizeLogin(body.login);
  const password = String(body.password ?? '');
  return { login, password };
}
