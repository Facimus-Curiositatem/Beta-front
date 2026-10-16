import { RolAcceso } from './rol-acceso';

export interface Usuario {
    id: number;
    nombre: string;
    email: string;
    rolAcceso: RolAcceso;
    activo: boolean;
}
