import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { TokenService } from '../service/token.service';

/** Sin token no se entra a las paginas privadas: se redirige al login. */
export const authGuard: CanActivateFn = () => {
  if (inject(TokenService).hayToken()) {
    return true;
  }
  return inject(Router).createUrlTree(['/login']);
};
