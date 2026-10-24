import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { PermisoEstructuraComponent } from './permiso-estructura.component';
describe('PermisoEstructuraComponent', () => {
  const permiso = {
    rolAcceso: 'EDITOR',
    crearPool: true,
    editarPool: true,
    eliminarPool: false,
    crearLane: true,
    editarLane: true,
    eliminarLane: false
  };
  beforeEach(() =>
    TestBed.configureTestingModule({
      imports: [PermisoEstructuraComponent],
      providers: [provideHttpClient(), provideHttpClientTesting()]
    })
  );
  afterEach(() => TestBed.inject(HttpTestingController).verify());
  it('muestra seis checkboxes y envía los cambios sin rolAcceso en body', () => {
    const f = TestBed.createComponent(PermisoEstructuraComponent);
    f.detectChanges();
    const http = TestBed.inject(HttpTestingController);
    http.expectOne('/api/v1/permisos-estructura').flush([permiso]);
    f.detectChanges();
    expect(f.nativeElement.querySelectorAll('input[type="checkbox"]').length).toBe(6);
    f.componentInstance.rows.at(0).controls.crearPool.setValue(false);
    f.componentInstance.guardar(0);
    const req = http.expectOne('/api/v1/permisos-estructura/EDITOR');
    expect(req.request.body.crearPool).toBeFalse();
    expect(req.request.body.rolAcceso).toBeUndefined();
    req.flush({ ...permiso, crearPool: false });
    expect(f.componentInstance.message()).toBe('Permisos guardados');
  });
  it('permite reintento al fallar actualización', () => {
    const f = TestBed.createComponent(PermisoEstructuraComponent);
    f.detectChanges();
    const http = TestBed.inject(HttpTestingController);
    http.expectOne('/api/v1/permisos-estructura').flush([permiso]);
    f.componentInstance.guardar(0);
    http
      .expectOne('/api/v1/permisos-estructura/EDITOR')
      .flush({ detail: 'Sin permiso' }, { status: 403, statusText: 'Forbidden' });
    expect(f.componentInstance.saving()).toBeNull();
    expect(f.componentInstance.message()).toBe('Sin permiso');
  });
});
