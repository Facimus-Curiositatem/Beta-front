export type TipoGateway = 'EXCLUSIVO' | 'PARALELO' | 'INCLUSIVO';

export interface GatewayResponse {
  id: number;
  nombre: string;
  tipoGateway: TipoGateway;
  posicionX: number;
  posicionY: number;
  laneId: number;
}

export interface GatewayRequest {
  nombre: string;
  tipoGateway: TipoGateway;
  posicionX: number;
  posicionY: number;
}