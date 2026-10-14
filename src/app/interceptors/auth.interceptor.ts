import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { environment } from '../../environments/environment';
import { TokenService } from '../service/token.service';

/** Agrega "Authorization: Bearer <token>" a las peticiones hacia nuestra API, y solo a esas. */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = inject(TokenService).obtener();
  if (!token || !req.url.startsWith(environment.apiUrl)) {
    return next(req);
  }
  return next(req.clone({
    setHeaders: { Authorization: `Bearer ${token}` },
  }));
};
