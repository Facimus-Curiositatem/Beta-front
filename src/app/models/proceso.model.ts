// Contrato de ProcesoResponse en Beta-back/main; reutilizable por H3.
export interface ProcesoResponse {
  id: number;
  nombre: string;
  descripcion: string | null;
  categoria: string;
  estado: string;
  activo: boolean;
  fechaCreacion: string;
  fechaModificacion: string;
}
