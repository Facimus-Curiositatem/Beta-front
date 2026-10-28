import { HistorialCambioResponse } from './historial.model';
import { PoolResponse } from './pool.model';
import { LaneResponse } from './lane.model';
import { ActividadResponse } from './actividad.model';
import { GatewayResponse } from './gateway.model';
import { EventoMensajeResponse } from './evento-mensaje.model';
import { ArcoResponse } from './arco.model';
import { MensajeResponse } from './mensaje.model';

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

export interface ProcesoDiagramaResponse {
  proceso: ProcesoResponse;
  pools: PoolResponse[];
  lanes: LaneResponse[];
  actividades: ActividadResponse[];
  gateways: GatewayResponse[];
  eventos: EventoMensajeResponse[];
  arcos: ArcoResponse[];
  mensajes: MensajeResponse[];
}
