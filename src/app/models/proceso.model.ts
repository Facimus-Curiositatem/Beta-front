export type EstadoProceso = 'BORRADOR' | 'PUBLICADO';

/** Mismos nombres que ProcesoResponse del backend. Las fechas llegan como texto ISO-8601. */
export interface Proceso {
  id: number;
  nombre: string;
  descripcion: string;
  categoria: string;
  estado: EstadoProceso;
  activo: boolean;
  fechaCreacion: string;
  fechaModificacion: string;
}

/** Lo que el cliente envia al crear o editar: sin id ni campos que decide el backend. */
export type ProcesoRequest = Pick<Proceso, 'nombre' | 'descripcion' | 'categoria'>;

export interface HistorialCambio {
  id: number;
  fechaCambio: string;
  descripcionCambio: string;
  autorNombre: string;
}

export interface ProcesoDetalle {
  proceso: Proceso;
  historial: HistorialCambio[];
}

export interface FiltrosProceso {
  nombre: string | null;
  estado: EstadoProceso | null;
  categoria: string | null;
  verEliminados: boolean | null;
}
