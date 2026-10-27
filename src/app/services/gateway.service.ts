import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { GatewayRequest, GatewayResponse } from '../models/gateway.model';
import { ImpactoEliminacionResponse } from '../models/impacto-eliminacion.model';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class GatewayService {
  private readonly http = inject(HttpClient);
  private readonly api = environment.apiUrl;

  listar(laneId: number): Observable<GatewayResponse[]> {
    return this.http.get<GatewayResponse[]>(`${this.api}/lanes/${laneId}/gateways`);
  }

  obtener(id: number): Observable<GatewayResponse> {
    return this.http.get<GatewayResponse>(`${this.api}/gateways/${id}`);
  }

  crear(laneId: number, request: GatewayRequest): Observable<GatewayResponse> {
    return this.http.post<GatewayResponse>(`${this.api}/lanes/${laneId}/gateways`, request);
  }

  editar(id: number, request: GatewayRequest): Observable<GatewayResponse> {
    return this.http.put<GatewayResponse>(`${this.api}/gateways/${id}`, request);
  }

  evaluarImpacto(id: number): Observable<ImpactoEliminacionResponse> {
    return this.http.get<ImpactoEliminacionResponse>(`${this.api}/gateways/${id}/impacto-eliminacion`);
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.api}/gateways/${id}`);
  }
}