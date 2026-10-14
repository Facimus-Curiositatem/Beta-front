import { Injectable } from '@angular/core';

import { RolAcceso, Usuario } from '../models/usuario.model';

/** Unico lugar que lee y escribe la sesion en localStorage. */
@Injectable({ providedIn: 'root' })
export class TokenService {
  private readonly CLAVE_TOKEN = 'token';
  private readonly CLAVE_USUARIO = 'usuario';

  guardar(token: string, usuario: Usuario): void {
    localStorage.setItem(this.CLAVE_TOKEN, token);
    localStorage.setItem(this.CLAVE_USUARIO, JSON.stringify(usuario));
  }

  obtener(): string | null {
    return localStorage.getItem(this.CLAVE_TOKEN);
  }

  obtenerUsuario(): Usuario | null {
    const usuario = localStorage.getItem(this.CLAVE_USUARIO);
    return usuario ? (JSON.parse(usuario) as Usuario) : null;
  }

  borrar(): void {
    localStorage.removeItem(this.CLAVE_TOKEN);
    localStorage.removeItem(this.CLAVE_USUARIO);
  }

  hayToken(): boolean {
    return this.obtener() !== null;
  }

  tieneRol(...roles: RolAcceso[]): boolean {
    const usuario = this.obtenerUsuario();
    return usuario !== null && roles.includes(usuario.rolAcceso);
  }
}
