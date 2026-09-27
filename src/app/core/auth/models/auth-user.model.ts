import { Role } from './permission.model';

export interface AuthUser {
  id: string;
  email: string;
  fullName: string;
  roles: Role[];
}

export interface AuthTokens {
  accessToken: string;
  expiresInSeconds: number;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterRequest {
  fullName: string;
  email: string;
  address1: string;
  address2: string | null;
  city: string;
  state: string;
  password: string;
}

export interface ResetPasswordRequest {
  token: string;
  password: string;
}

export interface VerifyEmailRequest {
  token: string;
}

export interface AuthSession {
  user: AuthUser;
  tokens: AuthTokens;
}
