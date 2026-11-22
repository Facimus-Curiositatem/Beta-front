import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { catchError, map, of } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { TokenService } from '../services/token.service';

export const authGuard: CanActivateFn = (_route, state) => {
  const tokens = inject(TokenService);
  const auth = inject(AuthService);
  if (tokens.tieneSesion()) {
    return true;
  }

  // Manda al login y recuerda a donde queria ir
  const login = inject(Router).createUrlTree(['/login'], {
    queryParams: { returnUrl: state.url }
  });

  if (!tokens.getRefreshToken()) {
    tokens.removeToken();
    return login;
  }
  return auth.refrescar().pipe(
    map(() => true),
    catchError(() => {
      tokens.removeToken();
      return of(login);
    })
  );
};