import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PoolRequest, PoolResponse, EditarPoolRequest } from '../models/pool.model';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class PoolService {
  private readonly http = inject(HttpClient);
  private readonly api = environment.apiUrl;

  listar(procesoId: number): Observable<PoolResponse[]> {
    return this.http.get<PoolResponse[]>(`${this.api}/procesos/${procesoId}/pools`);
  }

  obtener(id: number): Observable<PoolResponse> {
    return this.http.get<PoolResponse>(`${this.api}/pools/${id}`);
  }

  crear(procesoId: number, request: PoolRequest): Observable<PoolResponse> {
    return this.http.post<PoolResponse>(`${this.api}/procesos/${procesoId}/pools`, request);
  }

  editar(id: number, request: EditarPoolRequest): Observable<PoolResponse> {
    return this.http.put<PoolResponse>(`${this.api}/pools/${id}`, request);
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.api}/pools/${id}`);
  }
}
