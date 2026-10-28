import { TestBed } from '@angular/core/testing';
import { provideRouter, withComponentInputBinding, Router } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { routes } from './app.routes';
import { TokenService } from './services/token.service';
import { RolProcesoFormComponent } from './components/rol-proceso-form/rol-proceso-form.component';

describe('Rutas administrativas H8', () => {
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
    await h.navigateByUrl('/roles');
    expect(TestBed.inject(Router).url).toBe('/login');
  });
  it('impide a editor abrir administración', async () => {
    login('EDITOR');
    const h = await RouterTestingHarness.create();
    await h.navigateByUrl('/roles');
    expect(TestBed.inject(Router).url).toContain('/procesos?aviso=sin-permiso');
    // La redirección abre el listado real de procesos, que pide la primera página.
    TestBed.inject(HttpTestingController)
      .expectOne(req => req.url === '/api/v1/procesos')
      .flush({ content: [], page: 0, size: 10, totalElements: 0, totalPages: 0 });
  });
  it('vincula id de ruta al formulario de edición', async () => {
    login();
    const h = await RouterTestingHarness.create();
    const c = await h.navigateByUrl('/roles/7/editar', RolProcesoFormComponent);
    expect(c.id()).toBe('7');
    TestBed.inject(HttpTestingController)
      .expectOne('/api/v1/roles/7')
      .flush({ id: 7, nombre: 'Ventas', descripcion: null });
  });
});
