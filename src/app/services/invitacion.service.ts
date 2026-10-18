import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { API_URL } from '../config/api.config';
import { Usuario } from '../models/usuario';
import { invitacionRequest } from '../models/invitacion-request';
import { invitacionResponse } from '../models/invitacion-response';
import { AceptarInvitacionRequest } from '../models/aceptar-invitacion-request';

@Injectable({ providedIn: 'root' })
export class InvitacionService {
    private http = inject(HttpClient);
    private url = `${API_URL}/usuarios/invitaciones`;

    create(request: invitacionRequest): Observable<invitacionResponse> {
        return this.http.post<invitacionResponse>(this.url, request);
    }
    // el request es lo que yo quiero enviar desde el front al back
    accept(token: string, request: AceptarInvitacionRequest): Observable<Usuario> {
        return this.http.post<Usuario>(`${this.url}/${encodeURIComponent(token)}/aceptar`, request);
    }
    //ese token es el que se envia por email y se usa para aceptar la invitacion, y crear el usuario :) 

    // escrito a mano por mi los comentarios xdddd
}