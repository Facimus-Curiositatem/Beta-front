import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { TokenService } from '../service/token.service';

/** Sin token no se entra a las paginas privadas: se navega al login. */
export const authGuard: CanActivateFn = () => {
  if (inject(TokenService).hayToken()) {
    return true;
  }
  inject(Router).navigate(['/login']);
  return false;
};
