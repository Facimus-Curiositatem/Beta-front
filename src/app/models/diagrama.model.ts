import { TipoActividad } from './actividad.model';
import { TipoGateway } from './gateway.model';
import { TipoEventoMensaje } from './evento-mensaje.model';

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
  tipo: 'SECUENCIA' | 'MENSAJE';
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
