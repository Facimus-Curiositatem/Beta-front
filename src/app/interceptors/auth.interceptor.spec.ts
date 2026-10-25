import { TestBed } from '@angular/core/testing';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { authInterceptor } from './auth.interceptor';
import { TokenService } from '../services/token.service';

describe('authInterceptor', () => {
  let http: HttpClient;
  let httpTesting: HttpTestingController;
  let tokenService: TokenService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting()
      ]
    });
    http = TestBed.inject(HttpClient);
    httpTesting = TestBed.inject(HttpTestingController);
    tokenService = TestBed.inject(TokenService);
  });

  afterEach(() => {
    httpTesting.verify();
    localStorage.clear();
  });

  it('debe agregar el header Authorization cuando hay token', () => {
    tokenService.setToken('mi-token');

    http.get('/api/v1/test').subscribe();

    const req = httpTesting.expectOne('/api/v1/test');
    expect(req.request.headers.get('Authorization')).toBe('Bearer mi-token');
    req.flush({});
  });

  it('no debe agregar el header cuando no hay token', () => {
    http.get('/api/v1/test').subscribe();

    const req = httpTesting.expectOne('/api/v1/test');
    expect(req.request.headers.has('Authorization')).toBeFalse();
    req.flush({});
  });
  it('no envía un token anterior al iniciar sesión o registrar empresa', () => {
    tokenService.setToken('token-anterior');
    for (const url of ['/api/v1/auth/login', '/api/v1/empresas']) {
      http.post(url, {}).subscribe();
      const req = httpTesting.expectOne(url);
      expect(req.request.headers.has('Authorization')).toBeFalse();
      req.flush({});
    }
  });
  it('no filtra el token a otra API', () => {
    tokenService.setToken('token-anterior');
    http.get('https://example.org/otra-api').subscribe();
    const req = httpTesting.expectOne('https://example.org/otra-api');
    expect(req.request.headers.has('Authorization')).toBeFalse();
    req.flush({});
  });
});
