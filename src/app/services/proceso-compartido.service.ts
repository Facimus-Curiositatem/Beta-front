import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  CompartirProcesoRequest,
  ProcesoCompartidoResponse,
  ProcesoCompartidoDetalleResponse
} from '../models/proceso-compartido.model';

@Injectable({ providedIn: 'root' })
export class ProcesoCompartidoService {
  private readonly http = inject(HttpClient);
  private readonly url = environment.apiUrl;
  listarCompartidosPorMi(procesoId: number): Observable<ProcesoCompartidoResponse[]> {
    return this.http.get<ProcesoCompartidoResponse[]>(
      `${this.url}/procesos/${procesoId}/compartidos`
    );
  }
  compartir(
    procesoId: number,
    request: CompartirProcesoRequest
  ): Observable<ProcesoCompartidoResponse> {
    return this.http.post<ProcesoCompartidoResponse>(
      `${this.url}/procesos/${procesoId}/compartidos`,
      request
    );
  }
  revocar(procesoId: number, empresaInvitadaId: number): Observable<void> {
    return this.http.delete<void>(
      `${this.url}/procesos/${procesoId}/compartidos/${empresaInvitadaId}`
    );
  }
  listarCompartidosConmigo(): Observable<ProcesoCompartidoResponse[]> {
    return this.http.get<ProcesoCompartidoResponse[]>(`${this.url}/procesos-compartidos`);
  }
  verDetalle(procesoId: number): Observable<ProcesoCompartidoDetalleResponse> {
    return this.http.get<ProcesoCompartidoDetalleResponse>(
      `${this.url}/procesos-compartidos/${procesoId}`
    );
  }
}
