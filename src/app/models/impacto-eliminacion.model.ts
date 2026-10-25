// Respuesta comun de los endpoints /impacto-eliminacion (arcos, actividades, gateways)
export interface ImpactoEliminacionResponse {
  requiereConfirmacion: boolean;
  rompeContinuidad: boolean;
  advertencias: string[];
}
