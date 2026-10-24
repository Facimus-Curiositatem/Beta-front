export type RolAcceso = 'ADMINISTRADOR' | 'EDITOR' | 'SOLO_LECTURA';

export interface UsuarioResponse {
  id: number;
  nombre: string;
  email: string;
  rolAcceso: RolAcceso;
  activo: boolean;
}

export interface CrearUsuarioRequest {
  nombre: string;
  email: string;
  password: string;
  rolAcceso: RolAcceso;
}

export interface ActualizarUsuarioRequest {
  rolAcceso?: RolAcceso;
  activo?: boolean;
}