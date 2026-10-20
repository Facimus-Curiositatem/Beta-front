import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ProcesoRequest } from '../models/proceso-request';
import { EditarProcesoRequest } from '../models/editar-proceso-request';
import { CambiarEstadoRequest } from '../models/cambiar-estado-request';
import { ProcesoResponse } from '../models/proceso-response';
import { ProcesoDetalleResponse } from '../models/proceso-detalle-response';
import { HistorialCambioResponse } from '../models/historial-cambio-response';
import { ProcesoDiagramaResponse } from '../models/proceso-diagrama-response';
import { PageResponse } from '../models/page-response';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ProcesoService {
  private readonly http = inject(HttpClient);
  private readonly api = `${environment.apiUrl}/procesos`;

  buscar(
    nombre?: string,
    estado?: string,
    categoria?: string,
    activo?: boolean,
    pagina = 0
  ): Observable<PageResponse<ProcesoResponse>> {
    let params = new HttpParams().set('pagina', pagina);
    if (nombre) params = params.set('nombre', nombre);
    if (estado) params = params.set('estado', estado);
    if (categoria) params = params.set('categoria', categoria);
    if (activo !== undefined) params = params.set('activo', activo);
    return this.http.get<PageResponse<ProcesoResponse>>(this.api, { params });
  }

  obtener(id: number): Observable<ProcesoDetalleResponse> {
    return this.http.get<ProcesoDetalleResponse>(`${this.api}/${id}`);
  }

  crear(request: ProcesoRequest): Observable<ProcesoResponse> {
    return this.http.post<ProcesoResponse>(this.api, request);
  }

  editar(id: number, request: EditarProcesoRequest): Observable<ProcesoResponse> {
    return this.http.put<ProcesoResponse>(`${this.api}/${id}`, request);
  }

  cambiarEstado(id: number, request: CambiarEstadoRequest): Observable<ProcesoResponse> {
    return this.http.patch<ProcesoResponse>(`${this.api}/${id}`, request);
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.api}/${id}`);
  }

  obtenerHistorial(id: number): Observable<HistorialCambioResponse[]> {
    return this.http.get<HistorialCambioResponse[]>(`${this.api}/${id}/historial`);
  }

  obtenerDiagrama(id: number): Observable<ProcesoDiagramaResponse> {
    return this.http.get<ProcesoDiagramaResponse>(`${this.api}/${id}/diagrama`);
  }
}
