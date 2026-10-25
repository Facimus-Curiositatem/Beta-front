import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ArcoRequest, ArcoResponse, EditarArcoRequest } from '../models/arco.model';
import { ImpactoEliminacionResponse } from '../models/impacto-eliminacion.model';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ArcoService {
  private readonly http = inject(HttpClient);
  private readonly api = environment.apiUrl;

  crear(request: ArcoRequest): Observable<ArcoResponse> {
    return this.http.post<ArcoResponse>(`${this.api}/arcos`, request);
  }

  obtener(id: number): Observable<ArcoResponse> {
    return this.http.get<ArcoResponse>(`${this.api}/arcos/${id}`);
  }

  listar(poolId: number): Observable<ArcoResponse[]> {
    return this.http.get<ArcoResponse[]>(`${this.api}/pools/${poolId}/arcos`);
  }

  editar(id: number, request: EditarArcoRequest): Observable<ArcoResponse> {
    return this.http.put<ArcoResponse>(`${this.api}/arcos/${id}`, request);
  }

  evaluarImpacto(id: number): Observable<ImpactoEliminacionResponse> {
    return this.http.get<ImpactoEliminacionResponse>(`${this.api}/arcos/${id}/impacto-eliminacion`);
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.api}/arcos/${id}`);
  }
}
