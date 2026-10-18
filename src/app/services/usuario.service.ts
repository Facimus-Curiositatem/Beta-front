import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { API_URL } from '../config/api.config';
import { Usuario } from '../models/usuario';
import { CrearUsuarioRequest } from '../models/crear-usuario-request';
import { ActualizarUsuarioRequest } from '../models/actualizar-usuario-request';

@Injectable({ providedIn: 'root' })
export class UsuarioService {
    private http = inject(HttpClient);
    private url = `${API_URL}/usuarios`;

    list(): Observable<Usuario[]> {
        return this.http.get<Usuario[]>(this.url);
    }

    get(id: number): Observable<Usuario> {
        return this.http.get<Usuario>(`${this.url}/${id}`);
    }

    create(request: CrearUsuarioRequest): Observable<Usuario> {
        return this.http.post<Usuario>(this.url, request);
    }

    update(id: number, request: ActualizarUsuarioRequest): Observable<Usuario> {
        return this.http.patch<Usuario>(`${this.url}/${id}`, request);
    }

    delete(id: number): Observable<void> {
        return this.http.delete<void>(`${this.url}/${id}`);
    }
}