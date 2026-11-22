import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, finalize, shareReplay, tap } from 'rxjs';
import { LoginRequest, LoginResponse, RefreshRequest } from '../models/login.model';
import { environment } from '../../environments/environment';
import { TokenService } from './token.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly tokens = inject(TokenService);
  private readonly url = `${environment.apiUrl}/auth`;

  private refresco$?: Observable<LoginResponse>;

  login(request: LoginRequest): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(`${this.url}/login`, request)
      .pipe(tap((response) => this.guardar(response)));
  }

  refrescar(): Observable<LoginResponse> {
    const body: RefreshRequest = { refreshToken: this.tokens.getRefreshToken() ?? '' };
    this.refresco$ ??= this.http.post<LoginResponse>(`${this.url}/refresh`, body).pipe(
      tap((response) => this.guardar(response)),
      finalize(() => (this.refresco$ = undefined)),
      shareReplay(1)
    );
    return this.refresco$;
  }

  logout(): Observable<void> {
    return this.http
      .post<void>(`${this.url}/logout`, null)
      .pipe(finalize(() => this.tokens.removeToken()));
  }

  private guardar(response: LoginResponse): void {
    this.tokens.setToken(response.accessToken);
    this.tokens.setRefreshToken(response.refreshToken);
  }
}