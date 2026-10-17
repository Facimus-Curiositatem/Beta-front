export interface PoolResponse {
  id: number;
  nombre: string;
  tipoParticipante: string;
  cajaNegra: boolean;
  orden: number;
  procesoId: number;
}

export interface PoolRequest {
  nombre: string;
  tipoParticipante: string;
  cajaNegra: boolean;
}

export interface EditarPoolRequest {
  nombre: string;
  tipoParticipante: string;
  cajaNegra?: boolean;
}
