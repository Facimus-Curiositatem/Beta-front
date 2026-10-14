import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { PageResponse } from '../models/page-response.model';
import { EstadoProceso, FiltrosProceso, Proceso, ProcesoDetalle, ProcesoRequest } from '../models/proceso.model';

@Injectable({
  providedIn: 'root',
})
export class ProcesoService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/procesos`;

  /** HU-07: listado paginado con busqueda por nombre y filtros por estado, categoria y eliminados. */
  buscar(filtros: FiltrosProceso, pagina: number): Observable<PageResponse<Proceso>> {
    let params = new HttpParams().set('pagina', pagina);
    if (filtros.nombre?.trim()) {
      params = params.set('nombre', filtros.nombre.trim());
    }
    if (filtros.estado) {
      params = params.set('estado', filtros.estado);
    }
    if (filtros.categoria?.trim()) {
      params = params.set('categoria', filtros.categoria.trim());
    }
    if (filtros.verEliminados) {
      params = params.set('activo', false);
    }
    return this.http.get<PageResponse<Proceso>>(this.apiUrl, { params });
  }

  obtener(id: number): Observable<ProcesoDetalle> {
    return this.http.get<ProcesoDetalle>(`${this.apiUrl}/${id}`);
  }

  crear(proceso: ProcesoRequest): Observable<Proceso> {
    return this.http.post<Proceso>(this.apiUrl, proceso);
  }

  editar(id: number, proceso: ProcesoRequest): Observable<Proceso> {
    return this.http.put<Proceso>(`${this.apiUrl}/${id}`, proceso);
  }

  cambiarEstado(id: number, estado: EstadoProceso): Observable<Proceso> {
    return this.http.patch<Proceso>(`${this.apiUrl}/${id}`, { estado });
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
