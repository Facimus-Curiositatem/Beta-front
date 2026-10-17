export interface RolProcesoVistaResponse {
  id: number;
  nombre: string;
  descripcion: string;
  procesosQueLoUsan: number;
  enUso: boolean;
}
