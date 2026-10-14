/** Contrato de POST /api/v1/auth/login (Beta-back: LoginRequest / LoginResponse / UsuarioResponse). */
export interface LoginRequest {
  email: string;
  password: string;
}

// Valores vistos en SecurityConfig del back; el enum RolAcceso puede tener más.
export type RolAcceso = 'ADMINISTRADOR' | 'EDITOR' | (string & {});

export interface Usuario {
  id: number;
  nombre: string;
  email: string;
  rolAcceso: RolAcceso;
  activo: boolean;
}

export interface LoginResponse {
  accessToken: string;
  tokenType: string;
  /** Vigencia del token en segundos (por defecto 1800). */
  expiresIn: number;
  usuario: Usuario;
}

/** Errores del back: RFC 7807 (ProblemDetail). */
export interface ProblemDetail {
  title?: string;
  status?: number;
  detail?: string;
}
