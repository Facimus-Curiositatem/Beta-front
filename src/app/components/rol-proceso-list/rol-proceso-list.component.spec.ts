import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { RolProcesoListComponent } from './rol-proceso-list.component';
describe('RolProcesoListComponent', () => {
  const rol = {
    id: 1,
    nombre: 'Ventas',
    descripcion: 'Atención',
    procesos: ['Compra'],
    enUso: true
  };
  beforeEach(() =>
    TestBed.configureTestingModule({
      imports: [RolProcesoListComponent],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()]
    })
  );
  afterEach(() => TestBed.inject(HttpTestingController).verify());
  it('muestra uso y no permite eliminar rol en uso', () => {
    const f = TestBed.createComponent(RolProcesoListComponent);
    f.detectChanges();
    const http = TestBed.inject(HttpTestingController);
    http
      .expectOne((q) => q.url.endsWith('/roles/consulta'))
      .flush({ content: [rol], page: 0, size: 10, totalElements: 1, totalPages: 1 });
    f.detectChanges();
    expect(f.nativeElement.textContent).toContain('Compra');
    const buttons: Array<HTMLButtonElement> = Array.from(
      f.nativeElement.querySelectorAll('button')
    );
    expect(buttons.find((b) => b.textContent?.includes('Eliminar'))?.disabled).toBeTrue();
    f.componentInstance.eliminar(rol);
    http.expectNone('/api/v1/roles/1');
  });
  it('busca desde página cero y muestra respuesta vacía', () => {
    const f = TestBed.createComponent(RolProcesoListComponent);
    f.componentInstance.form.setValue({ nombre: 'Nuevo' });
    f.componentInstance.buscar();
    const req = TestBed.inject(HttpTestingController).expectOne((q) =>
      q.url.endsWith('/roles/consulta')
    );
    expect(req.request.params.get('pagina')).toBe('0');
    expect(req.request.params.get('nombre')).toBe('Nuevo');
    req.flush({ content: [], page: 0, size: 10, totalElements: 0, totalPages: 0 });
    expect(f.componentInstance.page()?.totalPages).toBe(0);
  });
  it('conserva mensaje de conflicto al eliminar', () => {
    spyOn(window, 'confirm').and.returnValue(true);
    const f = TestBed.createComponent(RolProcesoListComponent);
    f.componentInstance.eliminar({ ...rol, enUso: false });
    TestBed.inject(HttpTestingController)
      .expectOne('/api/v1/roles/1')
      .flush({ detail: 'Rol en uso' }, { status: 409, statusText: 'Conflict' });
    expect(f.componentInstance.message()).toBe('Rol en uso');
    expect(f.componentInstance.deleting()).toBeNull();
  });
});
