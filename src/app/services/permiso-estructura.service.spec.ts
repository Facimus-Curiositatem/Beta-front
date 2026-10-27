import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { PermisoEstructuraService } from './permiso-estructura.service';
describe('PermisoEstructuraService', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] })
  );
  afterEach(() => TestBed.inject(HttpTestingController).verify());
  it('lista configuración', () => {
    TestBed.inject(PermisoEstructuraService).listar().subscribe();
    const r = TestBed.inject(HttpTestingController).expectOne('/api/v1/permisos-estructura');
    expect(r.request.method).toBe('GET');
    r.flush([]);
  });
  it('actualiza los seis permisos por rol de acceso', () => {
    const body = {
      crearPool: true,
      editarPool: false,
      eliminarPool: false,
      crearLane: true,
      editarLane: true,
      eliminarLane: false
    };
    TestBed.inject(PermisoEstructuraService).actualizar('EDITOR', body).subscribe();
    const r = TestBed.inject(HttpTestingController).expectOne('/api/v1/permisos-estructura/EDITOR');
    expect(r.request.method).toBe('PUT');
    expect(r.request.body).toEqual(body);
    r.flush({ rolAcceso: 'EDITOR', ...body });
  });
});
