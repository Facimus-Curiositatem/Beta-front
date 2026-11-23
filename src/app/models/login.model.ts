import { RolAcceso, UsuarioResponse } from './usuario.model';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
  usuario: UsuarioResponse;
}

export interface RefreshRequest {
  refreshToken: string;
}

export interface TokenPayload {
  sub: string;
  usuarioId: number;
  empresaId: number;
  rol: RolAcceso;
  iss: string;
  iat: number;
  exp: number;
}