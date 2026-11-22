import { TestBed } from '@angular/core/testing';
import { HttpClient, HttpErrorResponse, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter, Router } from '@angular/router';
import { authInterceptor } from './auth.interceptor';
import { refreshInterceptor } from './refresh.interceptor';
import { TokenService } from '../services/token.service';

describe('refreshInterceptor', () => {
  let http: HttpClient;
  let httpTesting: HttpTestingController;
  let tokens: TokenService;
  let navigate: jasmine.Spy;

  const noAutorizado = { status: 401, statusText: 'Unauthorized' };
  const tokensNuevos = {
    accessToken: 'access-nuevo',
    refreshToken: 'refresh-nuevo',
    tokenType: 'Bearer',
    expiresIn: 900,
    usuario: {}
  };
  const esperar = () => new Promise((resolve) => setTimeout(resolve));

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        provideHttpClient(withInterceptors([authInterceptor, refreshInterceptor])),
        provideHttpClientTesting()
      ]
    });
    http = TestBed.inject(HttpClient);
    httpTesting = TestBed.inject(HttpTestingController);
    tokens = TestBed.inject(TokenService);
    navigate = spyOn(TestBed.inject(Router), 'navigate').and.resolveTo(true);
    tokens.setToken('access-vencido');
    tokens.setRefreshToken('refresh-vigente');
  });

  afterEach(() => {
    httpTesting.verify();
    localStorage.clear();
  });

  it('ante un 401 renueva los tokens y reintenta la petición con el token nuevo', () => {
    let respuesta: unknown;
    http.get('/api/v1/procesos').subscribe((r) => (respuesta = r));

    httpTesting.expectOne('/api/v1/procesos').flush(null, noAutorizado);
    const refresh = httpTesting.expectOne('/api/v1/auth/refresh');
    expect(refresh.request.method).toBe('POST');
    expect(refresh.request.body).toEqual({ refreshToken: 'refresh-vigente' });
    expect(refresh.request.headers.has('Authorization')).toBeFalse();
    refresh.flush(tokensNuevos);

    const reintento = httpTesting.expectOne('/api/v1/procesos');
    expect(reintento.request.headers.get('Authorization')).toBe('Bearer access-nuevo');
    reintento.flush(['proceso']);

    expect(respuesta).toEqual(['proceso']);
    expect(tokens.getToken()).toBe('access-nuevo');
    expect(tokens.getRefreshToken()).toBe('refresh-nuevo');
  });

  it('varios 401 simultáneos comparten un solo refresh', () => {
    http.get('/api/v1/procesos').subscribe();
    http.get('/api/v1/roles').subscribe();

    httpTesting.expectOne('/api/v1/procesos').flush(null, noAutorizado);
    httpTesting.expectOne('/api/v1/roles').flush(null, noAutorizado);
    // expectOne falla si hubiera dos POST a /auth/refresh
    httpTesting.expectOne('/api/v1/auth/refresh').flush(tokensNuevos);

    for (const url of ['/api/v1/procesos', '/api/v1/roles']) {
      const reintento = httpTesting.expectOne(url);
      expect(reintento.request.headers.get('Authorization')).toBe('Bearer access-nuevo');
      reintento.flush([]);
    }
  });

  it('si el refresh falla borra los tokens y va al login recordando la página', async () => {
    let error: HttpErrorResponse | undefined;
    http.get('/api/v1/procesos').subscribe({ error: (e) => (error = e) });

    httpTesting.expectOne('/api/v1/procesos').flush(null, noAutorizado);
    httpTesting.expectOne('/api/v1/auth/refresh').flush(null, noAutorizado);
    await esperar();

    expect(tokens.getToken()).toBeNull();
    expect(tokens.getRefreshToken()).toBeNull();
    expect(navigate).toHaveBeenCalledWith(['/login'], { queryParams: { returnUrl: '/' } });
    expect(error?.status).toBe(401);
  });

  it('sin refresh token cierra la sesión sin intentar renovar', async () => {
    localStorage.removeItem('refreshToken');
    http.get('/api/v1/procesos').subscribe({ error: () => {} });

    httpTesting.expectOne('/api/v1/procesos').flush(null, noAutorizado);
    httpTesting.expectNone('/api/v1/auth/refresh');
    await esperar();

    expect(tokens.getToken()).toBeNull();
    expect(navigate).toHaveBeenCalled();
  });

  it('un 401 del login (clave incorrecta) no dispara el refresh', () => {
    let error: HttpErrorResponse | undefined;
    http.post('/api/v1/auth/login', {}).subscribe({ error: (e) => (error = e) });

    httpTesting.expectOne('/api/v1/auth/login').flush(null, noAutorizado);
    httpTesting.expectNone('/api/v1/auth/refresh');

    expect(error?.status).toBe(401);
    expect(tokens.getToken()).toBe('access-vencido');
    expect(navigate).not.toHaveBeenCalled();
  });

  it('los errores que no son 401 pasan sin tocar la sesión', () => {
    let error: HttpErrorResponse | undefined;
    http.get('/api/v1/usuarios').subscribe({ error: (e) => (error = e) });

    httpTesting.expectOne('/api/v1/usuarios').flush(null, { status: 403, statusText: 'Forbidden' });
    httpTesting.expectNone('/api/v1/auth/refresh');

    expect(error?.status).toBe(403);
    expect(tokens.getToken()).toBe('access-vencido');
  });
});