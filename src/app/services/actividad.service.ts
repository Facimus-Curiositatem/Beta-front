import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ActividadRequest, ActividadResponse } from '../models/actividad.model';
import { ImpactoEliminacionResponse } from '../models/impacto-eliminacion.model';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ActividadService {
  private readonly http = inject(HttpClient);
  private readonly api = environment.apiUrl;

  listar(laneId: number): Observable<ActividadResponse[]> {
    return this.http.get<ActividadResponse[]>(`${this.api}/lanes/${laneId}/actividades`);
  }

  obtener(id: number): Observable<ActividadResponse> {
    return this.http.get<ActividadResponse>(`${this.api}/actividades/${id}`);
  }

  crear(laneId: number, request: ActividadRequest): Observable<ActividadResponse> {
    return this.http.post<ActividadResponse>(`${this.api}/lanes/${laneId}/actividades`, request);
  }

  editar(id: number, request: ActividadRequest): Observable<ActividadResponse> {
    return this.http.put<ActividadResponse>(`${this.api}/actividades/${id}`, request);
  }

  evaluarImpacto(id: number): Observable<ImpactoEliminacionResponse> {
    return this.http.get<ImpactoEliminacionResponse>(`${this.api}/actividades/${id}/impacto-eliminacion`);
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.api}/actividades/${id}`);
  }
}