/** Mismos valores que el enum RolAcceso del backend. */
export type RolAcceso = 'ADMINISTRADOR' | 'EDITOR' | 'SOLO_LECTURA';

/** Contrato de UsuarioResponse (Beta-back). */
export interface Usuario {
  id: number;
  nombre: string;
  email: string;
  rolAcceso: RolAcceso;
  activo: boolean;
}
