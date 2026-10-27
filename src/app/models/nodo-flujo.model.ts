export type TipoNodoFlujo = 'ACTIVIDAD' | 'GATEWAY' | 'EVENTO_MENSAJE';

/** Nodo de un pool (actividad, gateway o evento de mensaje) que puede ser origen o destino de un arco. */
export interface NodoFlujo {
  id: number;
  nombre: string;
  tipo: TipoNodoFlujo;
}
