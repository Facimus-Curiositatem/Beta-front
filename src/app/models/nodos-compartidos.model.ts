// DTOs del detalle recibido. Estos tipos no añaden operaciones de H6/H7.
export interface ActividadResponse {
  id: number;
  nombre: string;
  descripcion: string | null;
  posicionX: number;
  posicionY: number;
  laneId: number;
  tipoActividad: string;
}
export interface GatewayResponse {
  id: number;
  nombre: string;
  tipoGateway: string;
  posicionX: number;
  posicionY: number;
  laneId: number;
}
export interface EventoMensajeResponse {
  id: number;
  nombre: string;
  tipoEvento: string;
  contenido: string | null;
  claveCorrelacion: string | null;
  posicionX: number;
  posicionY: number;
  laneId: number;
  origenExterno: boolean;
}
export interface ArcoResponse {
  id: number;
  etiqueta: string | null;
  condicion: string | null;
  origenId: number;
  destinoId: number;
  poolId: number;
}
export interface MensajeResponse {
  id: number;
  nombre: string;
  contenido: string | null;
  poolOrigenId: number;
  poolDestinoId: number;
  procesoId: number;
  eventoThrowId: number | null;
  eventoCatchId: number | null;
  claveCorrelacion: string | null;
  tipoDestinoExterno: string | null;
  destinoExterno: string | null;
  politicaFalloNotificacion: string | null;
  actividadErrorId: number | null;
  politicaSinCaso: string | null;
  sinReceptor: boolean;
}
