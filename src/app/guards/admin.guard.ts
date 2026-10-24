import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { TokenService } from '../services/token.service';

export const adminGuard: CanActivateFn = () => {
  const tokens = inject(TokenService);
  const router = inject(Router);
  if (!tokens.tieneSesion()) {
    tokens.removeToken();
    return router.createUrlTree(['/login']);
  }
  return (
    tokens.esAdministrador() ||
    router.createUrlTree(['/procesos'], {
      queryParams: { aviso: 'sin-permiso' }
    })
  );
};
