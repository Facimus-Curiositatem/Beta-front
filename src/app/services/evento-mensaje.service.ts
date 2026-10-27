import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { EventoMensajeRequest, EventoMensajeResponse } from '../models/evento-mensaje.model';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class EventoMensajeService {
  private readonly http = inject(HttpClient);
  private readonly api = environment.apiUrl;

  crear(laneId: number, request: EventoMensajeRequest): Observable<EventoMensajeResponse> {
    return this.http.post<EventoMensajeResponse>(`${this.api}/lanes/${laneId}/eventos-mensaje`, request);
  }

  obtener(id: number): Observable<EventoMensajeResponse> {
    return this.http.get<EventoMensajeResponse>(`${this.api}/eventos-mensaje/${id}`);
  }

  listar(laneId: number): Observable<EventoMensajeResponse[]> {
    return this.http.get<EventoMensajeResponse[]>(`${this.api}/lanes/${laneId}/eventos-mensaje`);
  }

  editar(id: number, request: EventoMensajeRequest): Observable<EventoMensajeResponse> {
    return this.http.put<EventoMensajeResponse>(`${this.api}/eventos-mensaje/${id}`, request);
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.api}/eventos-mensaje/${id}`);
  }
}
