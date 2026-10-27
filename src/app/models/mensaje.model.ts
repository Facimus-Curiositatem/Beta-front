export type TipoDestinoExterno = 'CORREO' | 'SERVICIO_WEB' | 'COLA';
export type PoliticaFalloNotificacion = 'CONTINUAR_FLUJO' | 'DERIVAR_ACTIVIDAD_ERROR' | 'FINALIZAR_PROCESO';
export type PoliticaMensajeSinCaso = 'DESCARTAR' | 'INICIAR_CASO_NUEVO';

export interface MensajeRequest {
  nombre: string;
  contenido: string;
  poolOrigenId: number;
  poolDestinoId: number;
  eventoThrowId?: number;
  eventoCatchId?: number;
  claveCorrelacion?: string;
  tipoDestinoExterno?: TipoDestinoExterno;
  destinoExterno?: string;
  politicaFalloNotificacion?: PoliticaFalloNotificacion;
  actividadErrorId?: number;
  politicaSinCaso?: PoliticaMensajeSinCaso;
}

// Igual que MensajeRequest, pero los pools y el evento throw no se pueden cambiar al editar
export interface EditarMensajeRequest {
  nombre: string;
  contenido: string;
  eventoCatchId?: number;
  claveCorrelacion?: string;
  tipoDestinoExterno?: TipoDestinoExterno;
  destinoExterno?: string;
  politicaFalloNotificacion?: PoliticaFalloNotificacion;
  actividadErrorId?: number;
  politicaSinCaso?: PoliticaMensajeSinCaso;
}

// Los campos opcionales del request llegan como null cuando no se definieron
export interface MensajeResponse {
  id: number;
  nombre: string;
  contenido: string;
  poolOrigenId: number;
  poolDestinoId: number;
  procesoId: number;
  eventoThrowId: number | null;
  eventoCatchId: number | null;
  claveCorrelacion: string | null;
  tipoDestinoExterno: TipoDestinoExterno | null;
  destinoExterno: string | null;
  politicaFalloNotificacion: PoliticaFalloNotificacion | null;
  actividadErrorId: number | null;
  politicaSinCaso: PoliticaMensajeSinCaso | null;
  sinReceptor: boolean;
}
