import { TestBed } from '@angular/core/testing';
import { TokenService } from './token.service';

describe('TokenService', () => {
  let service: TokenService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
    service = TestBed.inject(TokenService);
  });

  afterEach(() => localStorage.clear());

  it('debe crearse', () => {
    expect(service).toBeTruthy();
  });

  it('debe almacenar y recuperar el token', () => {
    service.setToken('abc123');
    expect(service.getToken()).toBe('abc123');
  });

  it('debe retornar null si no hay token', () => {
    expect(service.getToken()).toBeNull();
  });

  it('debe eliminar el token', () => {
    service.setToken('abc123');
    service.removeToken();
    expect(service.getToken()).toBeNull();
  });
  it('rechaza tokens malformados, sin vencimiento o vencidos', () => {
    for (const token of [
      'mal',
      'h.invalido.s',
      'h.' + btoa('{}') + '.s',
      'h.' + btoa(JSON.stringify({ exp: 1 })) + '.s'
    ]) {
      service.setToken(token);
      expect(service.tieneSesion()).toBeFalse();
      expect(service.esAdministrador()).toBeFalse();
    }
  });
  it('reconoce sesión y rol de acceso de JWT vigente', () => {
    service.setToken(
      'h.' + btoa(JSON.stringify({ exp: Date.now() / 1000 + 1000, rol: 'ADMINISTRADOR' })) + '.s'
    );
    expect(service.tieneSesion()).toBeTrue();
    expect(service.esAdministrador()).toBeTrue();
  });
  it('sincroniza la sesión cuando otra pestaña cambia o elimina el token', () => {
    service.setToken('anterior');
    localStorage.setItem('accessToken', 'nuevo');
    window.dispatchEvent(
      new StorageEvent('storage', {
        key: 'accessToken',
        storageArea: localStorage,
        newValue: 'nuevo'
      })
    );
    expect(service.getToken()).toBe('nuevo');
    localStorage.clear();
    window.dispatchEvent(new StorageEvent('storage', { key: null, storageArea: localStorage }));
    expect(service.getToken()).toBeNull();
  });
});
