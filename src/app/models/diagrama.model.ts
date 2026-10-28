import { TipoActividad } from './actividad.model';
import { GatewayRequest, TipoGateway } from './gateway.model';
import { EventoMensajeRequest, TipoEventoMensaje } from './evento-mensaje.model';
import { PoliticaFalloNotificacion, PoliticaMensajeSinCaso, TipoDestinoExterno } from './mensaje.model';
import { LaneRequest } from './lane.model';
import { PoolRequest } from './pool.model';

export type TipoNodoDiagrama = 'ACTIVIDAD' | 'GATEWAY' | 'EVENTO';

export interface Punto {
  x: number;
  y: number;
}

export interface NodoDiagrama {
  id: number;
  tipo: TipoNodoDiagrama;
  subtipo: TipoActividad | TipoGateway | TipoEventoMensaje;
  nombre: string;
  laneId: number;
  // Relativas al área de contenido del lane, no al lienzo.
  x: number;
  y: number;
  ancho: number;
  alto: number;
}

export interface LaneDiagrama {
  id: number;
  nombre: string;
  top: number;
  alto: number;
  nodos: NodoDiagrama[];
}

export interface PoolDiagrama {
  id: number;
  nombre: string;
  cajaNegra: boolean;
  top: number;
  alto: number;
  lanes: LaneDiagrama[];
}

export interface CajaDiagrama {
  tipo: TipoNodoDiagrama;
  x: number;
  y: number;
  ancho: number;
  alto: number;
}

export interface DiagramaLayout {
  ancho: number;
  alto: number;
  pools: PoolDiagrama[];
  cajas: Map<number, CajaDiagrama>;
}

export interface ConexionDiagrama {
  clave: string;
  id: number;
  tipo: 'SECUENCIA' | 'MENSAJE';
  descripcion: string;
  trazo: string;
  punta: string;
  inicio: Punto;
  etiqueta: string;
  posicionEtiqueta: Punto;
}

export interface PosicionNodo {
  laneId: number;
  x: number;
  y: number;
}

export type TipoElementoPaleta = TipoNodoDiagrama | 'LANE' | 'POOL';

export interface ElementoPaleta {
  tipo: TipoElementoPaleta;
  subtipo?: NodoDiagrama['subtipo'];
  etiqueta: string;
}

export type Seleccion =
  | { tipo: 'NODO'; id: number }
  | { tipo: 'ARCO'; id: number }
  | { tipo: 'MENSAJE'; id: number }
  | { tipo: 'LANE'; id: number }
  | { tipo: 'POOL'; id: number };

export interface BorradorNodo {
  tipo: TipoNodoDiagrama;
  subtipo: NodoDiagrama['subtipo'];
  laneId: number;
  x: number;
  y: number;
}

export interface OpcionLane {
  id: number;
  nombre: string;
}

export interface CambiosActividad {
  nombre: string;
  descripcion: string;
  tipoActividad: TipoActividad;
  laneId: number;
}

export type CambiosGateway = Pick<GatewayRequest, 'nombre' | 'tipoGateway'>;

export interface OpcionNodo {
  id: number;
  nombre: string;
  requiereCondicion: boolean;
}

export interface CambiosArco {
  origenId: number;
  destinoId: number;
  etiqueta: string;
  condicion: string;
}

export type CambiosEvento = Omit<EventoMensajeRequest, 'posicionX' | 'posicionY'>;

export interface CambiosMensaje {
  nombre: string;
  contenido: string;
  claveCorrelacion: string;
  politicaSinCaso: PoliticaMensajeSinCaso;
  tipoDestinoExterno: TipoDestinoExterno | null;
  destinoExterno: string;
  politicaFalloNotificacion: PoliticaFalloNotificacion | null;
  actividadErrorId: number | null;
}

export type CambiosLane = LaneRequest;

export type CambiosPool = PoolRequest;

export interface BorradorMensaje {
  eventoThrowId: number;
  poolDestinoId: number;
}
