export interface RolProcesoVistaResponse {
  id: number;
  nombre: string;
  descripcion: string;
  procesosQueLoUsan: number;
  enUso: boolean;
}

export interface RolProcesoRequest {
  nombre: string;
  descripcion?: string;
}
export interface RolProcesoConsultaResponse {
  id: number;
  nombre: string;
  descripcion: string | null;
  procesos: string[];
  enUso: boolean;
}
