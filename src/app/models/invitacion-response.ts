import { RolAcceso } from './rol-acceso';

export interface invitacionResponse {
    nombre: string;
    email: string;
    rolAcceso: RolAcceso;
    toke: string;
    fechaExpiracion: string;
}
