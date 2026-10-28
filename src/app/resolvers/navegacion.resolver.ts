import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { Observable, catchError, forkJoin, map, of, switchMap } from 'rxjs';
import { LaneService } from '../services/lane.service';
import { PoolService } from '../services/pool.service';
import { ProcesoService } from '../services/proceso.service';
import { LaneResponse } from '../models/lane.model';
import { PoolResponse } from '../models/pool.model';
import { ProcesoResponse } from '../models/proceso.model';
import { LanesPorPool, TramoNavegacion } from '../models/navegacion.model';

function construirTramos(
  proceso: ProcesoResponse | null,
  pool: PoolResponse | null,
  lane: LaneResponse | null,
  seccion?: string
): TramoNavegacion[] {
  const tramos: TramoNavegacion[] = [{ etiqueta: 'Procesos', enlace: ['/procesos'] }];
  if (proceso) {
    tramos.push({ etiqueta: proceso.nombre, enlace: ['/procesos', proceso.id] });
    tramos.push({ etiqueta: 'Pools y lanes', enlace: ['/procesos', proceso.id, 'pools'] });
  }
  if (pool) {
    tramos.push({ etiqueta: pool.nombre, enlace: ['/pools', pool.id, 'lanes'] });
  }
  if (lane) {
    tramos.push({ etiqueta: lane.nombre });
  }
  if (seccion) {
    tramos.push({ etiqueta: seccion });
  }
  return tramos;
}

// Si alguna consulta falla se navega igual, con la ruta incompleta.
export function tramosResolver(
  nivel: 'proceso' | 'pool' | 'lane',
  parametro: string,
  seccion?: string
): ResolveFn<TramoNavegacion[]> {
  return route => {
    const procesoService = inject(ProcesoService);
    const poolService = inject(PoolService);
    const laneService = inject(LaneService);
    const id = Number(route.paramMap.get(parametro));

    const lane$: Observable<LaneResponse | null> = nivel === 'lane' ? laneService.obtener(id) : of(null);

    return lane$.pipe(
      switchMap(lane => {
        const poolId = lane?.poolId ?? (nivel === 'pool' ? id : null);
        const pool$: Observable<PoolResponse | null> = poolId === null ? of(null) : poolService.obtener(poolId);
        return pool$.pipe(map(pool => ({ lane, pool })));
      }),
      switchMap(({ lane, pool }) => {
        const procesoId = pool?.procesoId ?? (nivel === 'proceso' ? id : null);
        const proceso$: Observable<ProcesoResponse | null> = procesoId === null
          ? of(null)
          : procesoService.obtener(procesoId).pipe(map(detalle => detalle.proceso));
        return proceso$.pipe(map(proceso => construirTramos(proceso, pool, lane, seccion)));
      }),
      catchError(() => of(construirTramos(null, null, null, seccion)))
    );
  };
}

export const poolResolver: ResolveFn<PoolResponse | null> = route =>
  inject(PoolService).obtener(Number(route.paramMap.get('id'))).pipe(
    catchError(() => of(null))
  );

export const lanesPorPoolResolver: ResolveFn<LanesPorPool> = route => {
  const laneService = inject(LaneService);
  return inject(PoolService).listar(Number(route.paramMap.get('procesoId'))).pipe(
    switchMap(pools => pools.length === 0
      ? of({})
      : forkJoin(Object.fromEntries(pools.map(pool => [pool.id, laneService.listar(pool.id)])))),
    catchError(() => of({}))
  );
};
