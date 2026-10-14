import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';
import { LoginRequest, LoginResponse } from '../models/auth.model';

/** Solo hace las peticiones de autenticacion: guardar el token y navegar le toca al componente. */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/auth`;

  login(credenciales: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, credenciales);
  }

  /** El backend es stateless: el logout solo avisa al servidor. */
  logout(): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/logout`, null);
  }
}
