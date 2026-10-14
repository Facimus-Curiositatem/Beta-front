import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';

import { environment } from '../../../environments/environment';
import { LoginRequest, LoginResponse, Usuario } from '../models/auth.model';

const TOKEN_KEY = 'beta.token';
const USER_KEY = 'beta.usuario';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);

  private readonly _token = signal<string | null>(sessionStorage.getItem(TOKEN_KEY));
  private readonly _usuario = signal<Usuario | null>(this.leerUsuario());

  readonly usuario = this._usuario.asReadonly();
  readonly token = this._token.asReadonly();
  readonly autenticado = computed(() => this._token() !== null);

  login(credenciales: LoginRequest): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(`${environment.apiUrl}/auth/login`, credenciales)
      .pipe(tap((res) => this.guardarSesion(res)));
  }

  /** El back es stateless: logout avisa al servidor y descarta el token local. */
  logout(): void {
    this.http.post<void>(`${environment.apiUrl}/auth/logout`, {}).subscribe({ error: () => {} });
    this.limpiarSesion();
    this.router.navigate(['/login']);
  }

  limpiarSesion(): void {
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(USER_KEY);
    this._token.set(null);
    this._usuario.set(null);
  }

  private guardarSesion(res: LoginResponse): void {
    sessionStorage.setItem(TOKEN_KEY, res.accessToken);
    sessionStorage.setItem(USER_KEY, JSON.stringify(res.usuario));
    this._token.set(res.accessToken);
    this._usuario.set(res.usuario);
  }

  private leerUsuario(): Usuario | null {
    try {
      const raw = sessionStorage.getItem(USER_KEY);
      return raw ? (JSON.parse(raw) as Usuario) : null;
    } catch {
      return null;
    }
  }
}
