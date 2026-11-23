import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, from, switchMap, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { TokenService } from '../services/token.service';
import { necesitaToken } from './auth.interceptor';

export const refreshInterceptor: HttpInterceptorFn = (req, next) => {
  // Se inyectan aqui: dentro de catchError ya no hay contexto de inyeccion
  const auth = inject(AuthService);
  const tokens = inject(TokenService);
  const router = inject(Router);

  const cerrarSesion = (error: unknown) => {
    tokens.removeToken();
    return from(router.navigate(['/login'], { queryParams: { returnUrl: router.url } })).pipe(
      switchMap(() => throwError(() => error))
    );
  };

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status !== 401 || !necesitaToken(req.method, req.url)) {
        return throwError(() => error);
      }
      if (!tokens.getRefreshToken()) {
        return cerrarSesion(error);
      }
      return auth.refrescar().pipe(
        catchError((errorRefresh) => cerrarSesion(errorRefresh)),
        switchMap((respuesta) =>
          next(req.clone({ setHeaders: { Authorization: `Bearer ${respuesta.accessToken}` } }))
        )
      );
    })
  );
};