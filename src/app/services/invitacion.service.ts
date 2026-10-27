import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';
import { UsuarioResponse } from '../models/usuario.model';
import { InvitacionRequest, InvitacionResponse, AceptarInvitacionRequest } from '../models/invitacion.model';


@Injectable({ providedIn: 'root' })
export class InvitacionService {
    private readonly http = inject(HttpClient);
    private readonly url = `${environment.apiUrl}/usuarios/invitaciones`;

    create(request: InvitacionRequest): Observable<InvitacionResponse> {
        return this.http.post<InvitacionResponse>(this.url, request);
    }

    accept(token: string, request: AceptarInvitacionRequest): Observable<UsuarioResponse> {
        return this.http.post<UsuarioResponse>(`${this.url}/${encodeURIComponent(token)}/aceptar`, request);
    }
}