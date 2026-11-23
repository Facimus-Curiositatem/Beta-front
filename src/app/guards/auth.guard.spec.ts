import { TestBed } from '@angular/core/testing';
import { Router, UrlTree } from '@angular/router';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Observable } from 'rxjs';
import { authGuard } from './auth.guard';
import { TokenService } from '../services/token.service';

describe('authGuard', () => {
  let tokenService: TokenService;
  let router: Router;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()]
    });
    tokenService = TestBed.inject(TokenService);
    router = TestBed.inject(Router);
  });

  afterEach(() => localStorage.clear());

  it('debe permitir acceso cuando hay token', () => {
    tokenService.setToken(
      'header.' +
        btoa(JSON.stringify({ exp: Math.floor(Date.now() / 1000) + 3600, rol: 'EDITOR' })) +
        '.firma'
    );

    const result = TestBed.runInInjectionContext(() => authGuard({} as any, {} as any));

    expect(result).toBeTrue();
  });

  it('debe redirigir a /login cuando no hay token', () => {
    const result = TestBed.runInInjectionContext(() => authGuard({} as any, {} as any));

    expect(result).toBeInstanceOf(UrlTree);
    expect((result as UrlTree).toString()).toBe('/login');
  });

  function ejecutar(url: string) {
    return TestBed.runInInjectionContext(() => authGuard({} as any, { url } as any));
  }
  const vencido = 'h.' + btoa(JSON.stringify({ exp: 1, rol: 'EDITOR' })) + '.s';

  it('sin sesión ni refresh token manda al login con returnUrl', () => {
    const result = ejecutar('/procesos/5');
    expect((result as UrlTree).toString()).toBe('/login?returnUrl=%2Fprocesos%2F5');
  });

  it('con el token vencido y refresh token, renueva y deja entrar', () => {
    tokenService.setToken(vencido);
    tokenService.setRefreshToken('refresh');
    let resultado: unknown;
    (ejecutar('/procesos') as Observable<unknown>).subscribe((r) => (resultado = r));

    TestBed.inject(HttpTestingController)
      .expectOne('/api/v1/auth/refresh')
      .flush({ accessToken: 'access-nuevo', refreshToken: 'refresh-nuevo' });

    expect(resultado).toBeTrue();
    expect(tokenService.getToken()).toBe('access-nuevo');
  });

  it('si el refresh falla borra los tokens y manda al login con returnUrl', () => {
    tokenService.setToken(vencido);
    tokenService.setRefreshToken('refresh');
    let resultado: unknown;
    (ejecutar('/procesos') as Observable<unknown>).subscribe((r) => (resultado = r));

    TestBed.inject(HttpTestingController)
      .expectOne('/api/v1/auth/refresh')
      .flush(null, { status: 401, statusText: 'Unauthorized' });

    expect((resultado as UrlTree).toString()).toBe('/login?returnUrl=%2Fprocesos');
    expect(tokenService.getToken()).toBeNull();
    expect(tokenService.getRefreshToken()).toBeNull();
  });
});