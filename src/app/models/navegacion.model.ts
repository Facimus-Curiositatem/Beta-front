import { LaneResponse } from './lane.model';

export interface TramoNavegacion {
  etiqueta: string;
  enlace?: (string | number)[];
}

export type LanesPorPool = Partial<Record<number, LaneResponse[]>>;
