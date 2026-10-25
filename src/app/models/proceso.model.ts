import { HistorialCambioResponse } from './historial.model';

export type EstadoProceso = 'BORRADOR' | 'PUBLICADO';

export interface ProcesoResponse {
  id: number;
  nombre: string;
  descripcion: string;
  categoria: string;
  estado: EstadoProceso;
  activo: boolean;
  fechaCreacion: string;
  fechaModificacion: string;
}

export interface ProcesoRequest {
  nombre: string;
  descripcion: string;
  categoria: string;
}

export interface EditarProcesoRequest {
  nombre: string;
  descripcion: string;
  categoria: string;
}

export interface CambiarEstadoRequest {
  estado: EstadoProceso;
}

export interface ProcesoDetalleResponse {
  proceso: ProcesoResponse;
  historial: HistorialCambioResponse[];
}

// Tipo minimo: el backend aun no documenta los campos del diagrama.
export interface ProcesoDiagramaResponse {
  [clave: string]: unknown;
}
