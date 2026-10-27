import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  PermisoEstructuraRequest,
  PermisoEstructuraResponse
} from '../models/permiso-estructura.model';

@Injectable({ providedIn: 'root' })
export class PermisoEstructuraService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}/permisos-estructura`;
  listar(): Observable<PermisoEstructuraResponse[]> {
    return this.http.get<PermisoEstructuraResponse[]>(this.url);
  }
  actualizar(
    rol: string,
    request: PermisoEstructuraRequest
  ): Observable<PermisoEstructuraResponse> {
    return this.http.put<PermisoEstructuraResponse>(`${this.url}/${rol}`, request);
  }
}
