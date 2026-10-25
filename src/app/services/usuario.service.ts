import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { API_URL } from '../config/api.config';
import { UsuarioResponse, CrearUsuarioRequest, ActualizarUsuarioRequest } from '../models/usuario.model';

@Injectable({ providedIn: 'root' })
export class UsuarioService {
    private http = inject(HttpClient);
    private url = `${API_URL}/usuarios`;

    list(): Observable<UsuarioResponse[]> {
        return this.http.get<UsuarioResponse[]>(this.url);
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