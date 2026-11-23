import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { RolAcceso } from '../models/usuario.model';
import { TokenService } from '../services/token.service';

export const rolGuard: CanActivateFn = (route) => {
  const rol = route.data['rol'] as RolAcceso;
  if (inject(TokenService).leerPayload()?.rol === rol) {
    return true;
  }
  return inject(Router).createUrlTree(['/procesos'], { queryParams: { aviso: 'sin-permiso' } });
};