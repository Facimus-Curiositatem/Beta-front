import { RolAcceso } from './rol-acceso';

export interface CrearUsuarioRequest {
    email: string;
    rolAcceso: RolAcceso;
}
