import { Usuario } from './usuario.model';

/** Contrato de POST /api/v1/auth/login (Beta-back: LoginRequest / LoginResponse). */
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  tokenType: string;
  /** Vigencia del token en segundos (por defecto 1800). */
  expiresIn: number;
  usuario: Usuario;
}
