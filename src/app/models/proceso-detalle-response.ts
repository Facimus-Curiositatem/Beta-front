import { HistorialCambioResponse } from './historial-cambio-response';
import { ProcesoResponse } from './proceso-response';

export interface ProcesoDetalleResponse {
  proceso: ProcesoResponse;
  historial: HistorialCambioResponse[];
}
