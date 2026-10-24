import { RolAcceso } from './usuario.model';

export interface InvitacionRequest {
  email: string;
  rolAcceso: RolAcceso;
}

export interface InvitacionResponse {
  id: number;
  email: string;
  rolAcceso: RolAcceso;
  token: string;
  fechaExpiracion: string;
}

export interface AceptarInvitacionRequest {
  nombre: string;
  password: string;
}