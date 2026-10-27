import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { RolProcesoFormComponent } from './rol-proceso-form.component';
describe('RolProcesoFormComponent', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      imports: [RolProcesoFormComponent],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()]
    })
  );
  afterEach(() => TestBed.inject(HttpTestingController).verify());
  it('no envía nombre vacío', () => {
    const f = TestBed.createComponent(RolProcesoFormComponent);
    f.componentInstance.submit();
    expect(f.componentInstance.form.invalid).toBeTrue();
    TestBed.inject(HttpTestingController).expectNone('/api/v1/roles');
  });
  it('crea un rol y regresa al listado', () => {
    const f = TestBed.createComponent(RolProcesoFormComponent);
    const nav = spyOn(TestBed.inject(Router), 'navigate').and.resolveTo(true);
    f.componentInstance.form.setValue({ nombre: 'Ventas', descripcion: 'Atención' });
    f.componentInstance.submit();
    TestBed.inject(HttpTestingController).expectOne('/api/v1/roles').flush({ id: 1 });
    expect(nav).toHaveBeenCalledWith(['/roles']);
  });
  it('carga y edita el rol de la ruta', () => {
    const f = TestBed.createComponent(RolProcesoFormComponent);
    f.componentRef.setInput('id', '7');
    f.detectChanges();
    const http = TestBed.inject(HttpTestingController);
    http.expectOne('/api/v1/roles/7').flush({ id: 7, nombre: 'Ventas', descripcion: null });
    expect(f.componentInstance.form.controls.nombre.value).toBe('Ventas');
    f.componentInstance.submit();
    const req = http.expectOne('/api/v1/roles/7');
    expect(req.request.method).toBe('PUT');
    req.flush({ detail: 'Nombre repetido' }, { status: 409, statusText: 'Conflict' });
    expect(f.componentInstance.message()).toBe('Nombre repetido');
    expect(f.componentInstance.saving()).toBeFalse();
  });
  it('permite reintentar carga fallida sin habilitar edición de datos no cargados', () => {
    const f = TestBed.createComponent(RolProcesoFormComponent);
    f.componentRef.setInput('id', '7');
    f.detectChanges();
    const http = TestBed.inject(HttpTestingController);
    http
      .expectOne('/api/v1/roles/7')
      .flush({ detail: 'Sin conexión' }, { status: 500, statusText: 'Error' });
    expect(f.componentInstance.loading()).toBeFalse();
    f.componentInstance.submit();
    http.expectNone('/api/v1/roles/7');
    f.componentInstance.cargar();
    http.expectOne('/api/v1/roles/7').flush({ id: 7, nombre: 'Ventas', descripcion: null });
    expect(f.componentInstance.form.controls.nombre.value).toBe('Ventas');
  });
  it('recarga al cambiar el ID sin recrear la pantalla', () => {
    const f = TestBed.createComponent(RolProcesoFormComponent);
    f.componentRef.setInput('id', '9');
    f.detectChanges();
    const http = TestBed.inject(HttpTestingController);
    http.expectOne('/api/v1/roles/9').flush({ id: 9, nombre: 'Ventas', descripcion: null });
    f.componentRef.setInput('id', '12');
    f.detectChanges();
    const req = http.expectOne('/api/v1/roles/12');
    req.flush({ id: 12, nombre: 'Compras', descripcion: null });
    expect(f.componentInstance.id()).toBe('12');
  });
});
