import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CorrelacionRequest, CorrelacionResponse } from '../models/correlacion.model';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class CorrelacionService {
  private readonly http = inject(HttpClient);
  private readonly api = environment.apiUrl;

  obtener(mensajeId: number): Observable<CorrelacionResponse> {
    return this.http.get<CorrelacionResponse>(`${this.api}/mensajes/${mensajeId}/correlacion`);
  }

  definir(mensajeId: number, request: CorrelacionRequest): Observable<CorrelacionResponse> {
    return this.http.put<CorrelacionResponse>(`${this.api}/mensajes/${mensajeId}/correlacion`, request);
  }

  eliminar(mensajeId: number): Observable<void> {
    return this.http.delete<void>(`${this.api}/mensajes/${mensajeId}/correlacion`);
  }
}
