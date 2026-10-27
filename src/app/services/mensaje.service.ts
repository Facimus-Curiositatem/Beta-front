import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { EditarMensajeRequest, MensajeRequest, MensajeResponse } from '../models/mensaje.model';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class MensajeService {
  private readonly http = inject(HttpClient);
  private readonly api = environment.apiUrl;

  listar(procesoId: number): Observable<MensajeResponse[]> {
    return this.http.get<MensajeResponse[]>(`${this.api}/procesos/${procesoId}/mensajes`);
  }

  obtener(id: number): Observable<MensajeResponse> {
    return this.http.get<MensajeResponse>(`${this.api}/mensajes/${id}`);
  }

  crear(procesoId: number, request: MensajeRequest): Observable<MensajeResponse> {
    return this.http.post<MensajeResponse>(`${this.api}/procesos/${procesoId}/mensajes`, request);
  }

  editar(id: number, request: EditarMensajeRequest): Observable<MensajeResponse> {
    return this.http.put<MensajeResponse>(`${this.api}/mensajes/${id}`, request);
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.api}/mensajes/${id}`);
  }
}
