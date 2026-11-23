import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, provideRouter, UrlTree } from '@angular/router';
import { rolGuard } from './rol.guard';
import { TokenService } from '../services/token.service';

describe('rolGuard', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
  });
  afterEach(() => localStorage.clear());

  function check(rolPedido: string) {
    const route = { data: { rol: rolPedido } } as unknown as ActivatedRouteSnapshot;
    return TestBed.runInInjectionContext(() => rolGuard(route, {} as never));
  }
  function conToken(rol: string, exp = Date.now() / 1000 + 3600) {
    TestBed.inject(TokenService).setToken('h.' + btoa(JSON.stringify({ rol, exp })) + '.s');
  }

  it('admite el rol pedido en data.rol', () => {
    conToken('ADMINISTRADOR');
    expect(check('ADMINISTRADOR')).toBeTrue();
  });
  it('rechaza otro rol y avisa sin-permiso en procesos', () => {
    conToken('EDITOR');
    expect((check('ADMINISTRADOR') as UrlTree).toString()).toBe('/procesos?aviso=sin-permiso');
  });
  it('rechaza cuando no hay token', () => {
    expect((check('ADMINISTRADOR') as UrlTree).toString()).toBe('/procesos?aviso=sin-permiso');
  });
  it('no mira el vencimiento: de eso se encarga authGuard', () => {
    conToken('ADMINISTRADOR', 1);
    expect(check('ADMINISTRADOR')).toBeTrue();
  });
});