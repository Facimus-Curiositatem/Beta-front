import { RolAcceso } from './rol-acceso';

export interface ActualizarUsuarioRequest {
    rolAcceso?: RolAcceso;
    activo?: boolean;
}
