import { TestBed } from '@angular/core/testing';
import { provideRouter, UrlTree } from '@angular/router';
import { adminGuard } from './admin.guard';
import { TokenService } from '../services/token.service';
describe('adminGuard', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
  });
  afterEach(() => localStorage.clear());
  function check(rol: string, exp = Date.now() / 1000 + 3600) {
    TestBed.inject(TokenService).setToken('h.' + btoa(JSON.stringify({ rol, exp })) + '.s');
    return TestBed.runInInjectionContext(() => adminGuard({} as never, {} as never));
  }
  it('admite administrador', () => expect(check('ADMINISTRADOR')).toBeTrue());
  it('rechaza editor', () =>
    expect((check('EDITOR') as UrlTree).toString()).toContain('sin-permiso'));
  it('rechaza expirado', () =>
    expect((check('ADMINISTRADOR', 1) as UrlTree).toString()).toBe('/login'));
});
