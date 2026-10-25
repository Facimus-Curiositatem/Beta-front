import { TestBed } from '@angular/core/testing';
import { provideRouter, withComponentInputBinding, Router } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { routes } from './app.routes';
import { TokenService } from './services/token.service';
import { CompartirProcesoComponent } from './components/compartir-proceso/compartir-proceso.component';

describe('Rutas de procesos compartidos H4', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [
        provideRouter(routes, withComponentInputBinding()),
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });
  });
  afterEach(() => {
    TestBed.inject(HttpTestingController).verify();
    localStorage.clear();
  });
  function login(rol = 'ADMINISTRADOR') {
    TestBed.inject(TokenService).setToken(
      'h.' + btoa(JSON.stringify({ exp: Date.now() / 1000 + 3600, rol })) + '.s'
    );
  }
  it('protege módulos privados sin sesión', async () => {
    const h = await RouterTestingHarness.create();
    await h.navigateByUrl('/procesos/10/compartir');
    expect(TestBed.inject(Router).url).toBe('/login');
  });
  it('impide a editor abrir administración', async () => {
    login('EDITOR');
    const h = await RouterTestingHarness.create();
    await h.navigateByUrl('/procesos/10/compartir');
    expect(TestBed.inject(Router).url).toContain('/procesos?aviso=sin-permiso');
  });
  it('vincula id de proceso al módulo compartir', async () => {
    login();
    const h = await RouterTestingHarness.create();
    const c = await h.navigateByUrl('/procesos/10/compartir', CompartirProcesoComponent);
    expect(c.id()).toBe('10');
    TestBed.inject(HttpTestingController).expectOne('/api/v1/procesos/10/compartidos').flush([]);
  });
});
