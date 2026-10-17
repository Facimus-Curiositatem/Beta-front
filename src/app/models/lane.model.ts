export interface LaneResponse {
  id: number;
  nombre: string;
  orden: number;
  poolId: number;
  rolProcesoId: number;
  rolProcesoNombre: string;
}

export interface LaneRequest {
  nombre: string;
  rolProcesoId: number;
}

export interface ReordenarLanesRequest {
  laneIds: number[];
}
