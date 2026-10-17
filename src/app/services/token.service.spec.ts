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
});
