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
  it('guarda token después de POST login exitoso', () => {
    const body = { email: 'admin@beta.co', password: '123456' };
    service.login(body).subscribe();
    const req = http.expectOne('/api/v1/auth/login');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(body);
    req.flush({
      accessToken: 'jwt',
      tokenType: 'Bearer',
      expiresIn: 3600,
      usuario: { id: 1, nombre: 'Sam', email: body.email, rolAcceso: 'ADMINISTRADOR', activo: true }
    });
    expect(TestBed.inject(TokenService).getToken()).toBe('jwt');
  });
  it('descarta token aunque logout responda con error', () => {
    TestBed.inject(TokenService).setToken('jwt');
    service.logout().subscribe({ error: () => {} });
    const req = http.expectOne('/api/v1/auth/logout');
    expect(req.request.method).toBe('POST');
    req.flush({}, { status: 500, statusText: 'Error' });
    expect(TestBed.inject(TokenService).getToken()).toBeNull();
  });
});
