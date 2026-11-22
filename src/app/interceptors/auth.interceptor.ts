import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { environment } from '../../environments/environment';
import { TokenService } from '../services/token.service';

const RUTAS_PUBLICAS = [
  `${environment.apiUrl}/auth/login`,
  `${environment.apiUrl}/auth/refresh`,
  `${environment.apiUrl}/empresas`
];

export function necesitaToken(metodo: string, url: string): boolean {
  const esApi = url.startsWith(`${environment.apiUrl}/`);
  const esPublica = metodo === 'POST' && RUTAS_PUBLICAS.includes(url);
  return esApi && !esPublica;
}

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = inject(TokenService).getToken();
  if (!token || !necesitaToken(req.method, req.url)) {
    return next(req);
  }

  return next(req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }));
};