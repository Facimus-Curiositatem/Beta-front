export type TipoActividad = | 'TAREA' | 'USUARIO' | 'SERVICIO' | 'MANUAL' | 'SCRIPT' | 'REGLA_NEGOCIO';

export interface ActividadResponse {
  id: number;
  nombre: string;
  descripcion: string | null;
  posicionX: number;
  posicionY: number;
  laneId: number;
  tipoActividad: TipoActividad;
}

export interface ActividadRequest {
  nombre: string;
  descripcion?: string;
  posicionX: number;
  posicionY: number;
  laneId?: number;
  tipoActividad?: TipoActividad;
}