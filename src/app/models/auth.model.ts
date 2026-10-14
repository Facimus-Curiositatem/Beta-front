import { Usuario } from './usuario.model';

export interface LoginRequest {
  email: string;
  password: string;
}

/** Mismos nombres que LoginResponse del backend. */
export interface LoginResponse {
  accessToken: string;
  tokenType: string;
  expiresIn: number;
  usuario: Usuario;
}
