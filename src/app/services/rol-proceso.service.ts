import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  RolProcesoVistaResponse,
  RolProcesoConsultaResponse,
  RolProcesoRequest
} from '../models/rol-proceso.model';
import { environment } from '../../environments/environment';

import { PageResponse } from '../models/page-response.model';

@Injectable({ providedIn: 'root' })
export class RolProcesoService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}/roles`;

  listar(): Observable<RolProcesoVistaResponse[]> {
    return this.http.get<RolProcesoVistaResponse[]>(this.url);
  }
  buscar(nombre = '', pagina = 0): Observable<PageResponse<RolProcesoConsultaResponse>> {
    const params = new HttpParams().set('nombre', nombre).set('pagina', pagina);
    return this.http.get<PageResponse<RolProcesoConsultaResponse>>(`${this.url}/consulta`, {
      params
    });
  }
  obtener(id: number): Observable<RolProcesoVistaResponse> {
    return this.http.get<RolProcesoVistaResponse>(`${this.url}/${id}`);
  }
  crear(request: RolProcesoRequest): Observable<RolProcesoVistaResponse> {
    return this.http.post<RolProcesoVistaResponse>(this.url, request);
  }
  editar(id: number, request: RolProcesoRequest): Observable<RolProcesoVistaResponse> {
    return this.http.put<RolProcesoVistaResponse>(`${this.url}/${id}`, request);
  }
  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }
}
