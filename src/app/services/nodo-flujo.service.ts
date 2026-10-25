import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, map, of, switchMap } from 'rxjs';
import { LaneService } from './lane.service';
import { NodoFlujo } from '../models/nodo-flujo.model';
import { environment } from '../../environments/environment';

interface NodoBase {
  id: number;
  nombre: string;
}

/**
 * El backend no expone los nodos de un pool en un solo endpoint, asi que se recorren
 * sus lanes y se juntan actividades, gateways y eventos de mensaje de cada uno.
 */
@Injectable({ providedIn: 'root' })
export class NodoFlujoService {
  private readonly http = inject(HttpClient);
  private readonly laneService = inject(LaneService);
  private readonly api = environment.apiUrl;

  listarPorPool(poolId: number): Observable<NodoFlujo[]> {
    return this.laneService.listar(poolId).pipe(
      switchMap(lanes => lanes.length === 0
        ? of([])
        : forkJoin(lanes.map(lane => this.listarPorLane(lane.id)))),
      map(grupos => grupos.flat())
    );
  }

  private listarPorLane(laneId: number): Observable<NodoFlujo[]> {
    return forkJoin([
      this.http.get<NodoBase[]>(`${this.api}/lanes/${laneId}/actividades`),
      this.http.get<NodoBase[]>(`${this.api}/lanes/${laneId}/gateways`),
      this.http.get<NodoBase[]>(`${this.api}/lanes/${laneId}/eventos-mensaje`)
    ]).pipe(
      map(([actividades, gateways, eventos]) => [
        ...actividades.map(n => ({ id: n.id, nombre: n.nombre, tipo: 'ACTIVIDAD' as const })),
        ...gateways.map(n => ({ id: n.id, nombre: n.nombre, tipo: 'GATEWAY' as const })),
        ...eventos.map(n => ({ id: n.id, nombre: n.nombre, tipo: 'EVENTO_MENSAJE' as const }))
      ])
    );
  }
}
