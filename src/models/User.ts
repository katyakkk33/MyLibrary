export type UserRole = 'USER' | 'ADMIN';

export interface User {
  id: number;
  login: string;
  password_hash: string;
  role: UserRole;
  created_at: string; // ISO
}

export interface PublicUser {
  id: number;
  login: string;
  role: UserRole;
  created_at: string;
}

export interface NewUserPayload {
  login: string;
  password: string;
}
