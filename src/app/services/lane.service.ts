import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { LaneRequest, LaneResponse, ReordenarLanesRequest } from '../models/lane.model';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class LaneService {
  private readonly http = inject(HttpClient);
  private readonly api = environment.apiUrl;

  listar(poolId: number): Observable<LaneResponse[]> {
    return this.http.get<LaneResponse[]>(`${this.api}/pools/${poolId}/lanes`);
  }

  obtener(id: number): Observable<LaneResponse> {
    return this.http.get<LaneResponse>(`${this.api}/lanes/${id}`);
  }

  crear(poolId: number, request: LaneRequest): Observable<LaneResponse> {
    return this.http.post<LaneResponse>(`${this.api}/pools/${poolId}/lanes`, request);
  }

  editar(id: number, request: LaneRequest): Observable<LaneResponse> {
    return this.http.put<LaneResponse>(`${this.api}/lanes/${id}`, request);
  }

  reordenar(poolId: number, request: ReordenarLanesRequest): Observable<LaneResponse[]> {
    return this.http.patch<LaneResponse[]>(`${this.api}/pools/${poolId}/lanes/orden`, request);
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.api}/lanes/${id}`);
  }
}
