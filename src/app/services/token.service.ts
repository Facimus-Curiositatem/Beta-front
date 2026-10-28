import { DestroyRef, Injectable, inject, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class TokenService {
  private readonly TOKEN_KEY = 'accessToken';
  private readonly token = signal<string | null>(localStorage.getItem(this.TOKEN_KEY));

  constructor() {
    const sincronizar = (event: StorageEvent) => {
      if (
        event.storageArea === localStorage &&
        (event.key === this.TOKEN_KEY || event.key === null)
      ) {
        this.token.set(localStorage.getItem(this.TOKEN_KEY));
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
  }

  // Leer claims orienta la interfaz; solo el backend verifica la firma del JWT.
  private claims(): { exp?: number; rol?: string } | null {
    const token = this.getToken();
    if (!token) return null;
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return null;
      const payload = parts[1].replace(/-/g, '+').replace(/_/g, '/');
      return JSON.parse(atob(payload.padEnd(Math.ceil(payload.length / 4) * 4, '=')));
    } catch {
      return null;
    }
  }

  tieneSesion(): boolean {
    const claims = this.claims();
    return typeof claims?.exp === 'number' && claims.exp * 1000 > Date.now();
  }

  esAdministrador(): boolean {
    return this.tieneSesion() && this.claims()?.rol === 'ADMINISTRADOR';
  }

  rol(): string | null {
    return this.tieneSesion() ? this.claims()?.rol ?? null : null;
  }

  removeToken(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    this.token.set(null);
  }
}
