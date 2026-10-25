import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, finalize, tap } from 'rxjs';
import { LoginRequest, LoginResponse } from '../models/login.model';
import { environment } from '../../environments/environment';
import { TokenService } from './token.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly tokens = inject(TokenService);
  private readonly url = `${environment.apiUrl}/auth`;

  login(request: LoginRequest): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(`${this.url}/login`, request)
      .pipe(tap((response) => this.tokens.setToken(response.accessToken)));
  }

  logout(): Observable<void> {
    // El servidor es stateless: se descarta el token incluso si falla la conexión.
    return this.http
      .post<void>(`${this.url}/logout`, null)
      .pipe(finalize(() => this.tokens.removeToken()));
  }
}
