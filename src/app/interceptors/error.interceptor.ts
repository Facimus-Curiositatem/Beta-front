import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { TokenService } from '../service/token.service';

/**
 * Si el backend responde 401 (token ausente, invalido o expirado), se cierra la sesion local y se
 * vuelve al login. El login fallido tambien es 401, pero ese error lo muestra la pagina de login.
 */
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const tokenService = inject(TokenService);
  const router = inject(Router);
  return next(req).pipe(
    catchError((err: HttpErrorResponse) => {
      if (err.status === 401 && !req.url.endsWith('/auth/login')) {
        tokenService.borrar();
        router.navigate(['/login']);
      }
      return throwError(() => err);
    }),
  );
};
