import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { AuthService } from './auth.service';
import { TokenService } from './token.service';

describe('AuthService sesión', () => {
  let service: AuthService;
  let http: HttpTestingController;
  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });
    service = TestBed.inject(AuthService);
    http = TestBed.inject(HttpTestingController);
  });
  afterEach(() => {
    http.verify();
    localStorage.clear();
  });
  it('guarda access token y refresh token después de POST login exitoso', () => {
    const body = { email: 'admin@beta.co', password: '123456' };
    service.login(body).subscribe();
    const req = http.expectOne('/api/v1/auth/login');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(body);
    req.flush({
      accessToken: 'jwt',
      refreshToken: 'refresh',
      tokenType: 'Bearer',
      expiresIn: 3600,
      usuario: { id: 1, nombre: 'Sam', email: body.email, rolAcceso: 'ADMINISTRADOR', activo: true }
    });
    expect(TestBed.inject(TokenService).getToken()).toBe('jwt');
    expect(TestBed.inject(TokenService).getRefreshToken()).toBe('refresh');
  });
  it('descarta ambos tokens aunque logout responda con error', () => {
    TestBed.inject(TokenService).setToken('jwt');
    TestBed.inject(TokenService).setRefreshToken('refresh');
    service.logout().subscribe({ error: () => {} });
    const req = http.expectOne('/api/v1/auth/logout');
    expect(req.request.method).toBe('POST');
    req.flush({}, { status: 500, statusText: 'Error' });
    expect(TestBed.inject(TokenService).getToken()).toBeNull();
    expect(TestBed.inject(TokenService).getRefreshToken()).toBeNull();
  });
  it('refrescar envía el refresh token y guarda los tokens nuevos', () => {
    const tokens = TestBed.inject(TokenService);
    tokens.setRefreshToken('refresh-viejo');
    service.refrescar().subscribe();
    const req = http.expectOne('/api/v1/auth/refresh');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ refreshToken: 'refresh-viejo' });
    req.flush({ accessToken: 'access-nuevo', refreshToken: 'refresh-nuevo', tokenType: 'Bearer', expiresIn: 900 });
    expect(tokens.getToken()).toBe('access-nuevo');
    expect(tokens.getRefreshToken()).toBe('refresh-nuevo');
  });
  it('refrescar comparte la petición en curso y libera la caché al terminar', () => {
    TestBed.inject(TokenService).setRefreshToken('refresh');
    expect(service.refrescar()).toBe(service.refrescar());
    service.refrescar().subscribe();
    service.refrescar().subscribe();
    http.expectOne('/api/v1/auth/refresh').flush({ accessToken: 'a', refreshToken: 'r' });
    // Terminado el primero, la siguiente llamada hace un refresh nuevo
    service.refrescar().subscribe();
    http.expectOne('/api/v1/auth/refresh').flush({ accessToken: 'b', refreshToken: 'r2' });
  });
});