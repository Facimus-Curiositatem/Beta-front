import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

import { environment } from '../../environments/environment';
import { TokenService } from '../service/token.service';

/**
 * Agrega el Bearer solo a las peticiones hacia nuestra API y, si el backend responde 401 fuera del
 * login (token ausente, invalido o expirado), cierra la sesion local y vuelve al login.
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const tokenService = inject(TokenService);
  const router = inject(Router);
  const token = tokenService.obtener();
  const esLogin = req.url.endsWith('/auth/login');

  const peticion = token && req.url.startsWith(environment.apiUrl)
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  return next(peticion).pipe(
    catchError((err: HttpErrorResponse) => {
      if (err.status === 401 && !esLogin) {
        tokenService.borrar();
        router.navigate(['/login']);
      }
      return throwError(() => err);
    }),
  );
};
