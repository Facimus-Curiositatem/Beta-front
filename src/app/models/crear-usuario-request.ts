import { RolAcceso } from './rol-acceso';

export interface CrearUsuarioRequest {
    nombre: string;
    email: string;
    password: string;      
    rolAcceso: RolAcceso;
}
