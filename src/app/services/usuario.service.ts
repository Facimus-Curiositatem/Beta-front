import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';
import { UsuarioResponse, CrearUsuarioRequest, ActualizarUsuarioRequest } from '../models/usuario.model';

@Injectable({ providedIn: 'root' })
export class UsuarioService {
    private readonly http = inject(HttpClient);
    private readonly url = `${environment.apiUrl}/usuarios`;

    // Sin filtro el backend lista los activos; con activo = false, los desactivados.
    list(activo?: boolean): Observable<UsuarioResponse[]> {
        const params = activo === undefined ? undefined : new HttpParams().set('activo', activo);
        return this.http.get<UsuarioResponse[]>(this.url, { params });
    }

    get(id: number): Observable<UsuarioResponse> {
        return this.http.get<UsuarioResponse>(`${this.url}/${id}`);
    }

    create(request: CrearUsuarioRequest): Observable<UsuarioResponse> {
        return this.http.post<UsuarioResponse>(this.url, request);
    }

    update(id: number, request: ActualizarUsuarioRequest): Observable<UsuarioResponse> {
        return this.http.patch<UsuarioResponse>(`${this.url}/${id}`, request);
    }

    delete(id: number): Observable<void> {
        return this.http.delete<void>(`${this.url}/${id}`);
    }
}