import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { environment } from '../../environments/environment';
import { TokenService } from '../services/token.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const tokenService = inject(TokenService);
  const token = tokenService.getToken();

  const esApi = req.url.startsWith(`${environment.apiUrl}/`);
  const esPublica =
    req.method === 'POST' &&
    (req.url === `${environment.apiUrl}/auth/login` ||
      req.url === `${environment.apiUrl}/empresas`);
  if (token && esApi && !esPublica) {
    req = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` }
    });
  }

  return next(req);
};
