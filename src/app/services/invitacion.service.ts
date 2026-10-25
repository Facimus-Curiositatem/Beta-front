import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { API_URL } from '../config/api.config';
import { UsuarioResponse } from '../models/usuario.model';
import { InvitacionRequest, InvitacionResponse, AceptarInvitacionRequest } from '../models/invitacion.model';


@Injectable({ providedIn: 'root' })
export class InvitacionService {
    private http = inject(HttpClient);
    private url = `${API_URL}/usuarios/invitaciones`;

    create(request: InvitacionRequest): Observable<InvitacionResponse> {
        return this.http.post<InvitacionResponse>(this.url, request);
    }
    // el request es lo que yo quiero enviar desde el front al back
    accept(token: string, request: AceptarInvitacionRequest): Observable<UsuarioResponse> {
        return this.http.post<UsuarioResponse>(`${this.url}/${encodeURIComponent(token)}/aceptar`, request);
    }
    //ese token es el que se envia por email y se usa para aceptar la invitacion, y crear el usuario :) 

    // escrito a mano por mi los comentarios xdddd
}