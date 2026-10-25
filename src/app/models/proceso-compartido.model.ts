import { ProcesoResponse } from './proceso.model';
import { PoolResponse } from './pool.model';
import { LaneResponse } from './lane.model';
import {
  ActividadResponse,
  GatewayResponse,
  EventoMensajeResponse,
  ArcoResponse,
  MensajeResponse
} from './nodos-compartidos.model';
export interface CompartirProcesoRequest {
  empresaInvitadaId: number;
}
export interface ProcesoCompartidoResponse {
  id: number;
  procesoId: number;
  procesoNombre: string;
  empresaPropietariaId: number;
  empresaPropietaria: string;
  empresaInvitadaId: number;
  empresaInvitada: string;
  soloLectura: boolean;
}
export interface ProcesoCompartidoDetalleResponse {
  proceso: ProcesoResponse;
  empresaPropietaria: string;
  soloLectura: boolean;
  pools: PoolResponse[];
  lanes: LaneResponse[];
  actividades: ActividadResponse[];
  gateways: GatewayResponse[];
  eventos: EventoMensajeResponse[];
  arcos: ArcoResponse[];
  mensajes: MensajeResponse[];
}
