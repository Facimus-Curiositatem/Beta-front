import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class TokenService {
  private readonly TOKEN_KEY = 'accessToken';

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  setToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
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

  removeToken(): void {
    localStorage.removeItem(this.TOKEN_KEY);
  }
}
