import { RolAcceso } from './rol-acceso';

export interface invitacionResponse {
    id: number;
    email: string;
    rolAcceso: RolAcceso;
    token: string;
    fechaExpiracion: string;
}