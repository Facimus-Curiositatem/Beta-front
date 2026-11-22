import { DestroyRef, Injectable, inject, signal } from '@angular/core';
import { jwtDecode } from 'jwt-decode';
import { TokenPayload } from '../models/login.model';
import { RolAcceso } from '../models/usuario.model';

@Injectable({ providedIn: 'root' })
export class TokenService {
  private readonly TOKEN_KEY = 'accessToken';
  private readonly REFRESH_KEY = 'refreshToken';
  private readonly token = signal<string | null>(localStorage.getItem(this.TOKEN_KEY));

  readonly usuario = signal<string | null>(this.leerPayload()?.sub ?? null);

  constructor() {
    const sincronizar = (event: StorageEvent) => {
      if (
        event.storageArea === localStorage &&
        (event.key === this.TOKEN_KEY || event.key === null)
      ) {
        this.token.set(localStorage.getItem(this.TOKEN_KEY));
        this.usuario.set(this.leerPayload()?.sub ?? null);
      }
    };
    window.addEventListener('storage', sincronizar);
    inject(DestroyRef).onDestroy(() => window.removeEventListener('storage', sincronizar));
  }

  getToken(): string | null {
    return this.token();
  }

  setToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
    this.token.set(token);
    this.usuario.set(this.leerPayload()?.sub ?? null);
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(this.REFRESH_KEY);
  }

  setRefreshToken(refreshToken: string | null | undefined): void {
    if (refreshToken) {
      localStorage.setItem(this.REFRESH_KEY, refreshToken);
    } else {
      localStorage.removeItem(this.REFRESH_KEY);
    }
  }

  leerPayload(): TokenPayload | null {
    const token = this.getToken();
    if (!token) return null;
    try {
      return jwtDecode<TokenPayload>(token);
    } catch {
      return null;
    }
  }

  tieneSesion(): boolean {
    const exp = this.leerPayload()?.exp;
    return typeof exp === 'number' && exp * 1000 > Date.now();
  }

  tieneRol(rol: RolAcceso): boolean {
    return this.tieneSesion() && this.leerPayload()?.rol === rol;
  }

  esAdministrador(): boolean {
    return this.tieneRol('ADMINISTRADOR');
  }

  rol(): string | null {
    return this.tieneSesion() ? this.leerPayload()?.rol ?? null : null;
  }

  removeToken(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_KEY);
    this.token.set(null);
    this.usuario.set(null);
  }
}