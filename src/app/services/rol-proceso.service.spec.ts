import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { RolProcesoService } from './rol-proceso.service';

describe('RolProcesoService contrato HTTP', () => {
  let s: RolProcesoService;
  let http: HttpTestingController;
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });
    s = TestBed.inject(RolProcesoService);
    http = TestBed.inject(HttpTestingController);
  });
  afterEach(() => http.verify());
  it('conserva listar para LaneForm', () => {
    s.listar().subscribe();
    const r = http.expectOne('/api/v1/roles');
    expect(r.request.method).toBe('GET');
    r.flush([]);
  });
  it('busca por nombre y página', () => {
    s.buscar('Ventas', 2).subscribe();
    const r = http.expectOne((q) => q.url === '/api/v1/roles/consulta');
    expect(r.request.params.get('nombre')).toBe('Ventas');
    expect(r.request.params.get('pagina')).toBe('2');
    r.flush({ content: [], page: 2, size: 10, totalElements: 0, totalPages: 0 });
  });
  it('obtiene detalle por ID', () => {
    s.obtener(4).subscribe();
    const r = http.expectOne('/api/v1/roles/4');
    expect(r.request.method).toBe('GET');
    r.flush({});
  });
  it('crea con request', () => {
    const body = { nombre: 'Ventas', descripcion: 'Atención' };
    s.crear(body).subscribe();
    const r = http.expectOne('/api/v1/roles');
    expect(r.request.method).toBe('POST');
    expect(r.request.body).toEqual(body);
    r.flush({});
  });
  it('edita por ID', () => {
    s.editar(4, { nombre: 'Soporte' }).subscribe();
    const r = http.expectOne('/api/v1/roles/4');
    expect(r.request.method).toBe('PUT');
    expect(r.request.body.nombre).toBe('Soporte');
    r.flush({});
  });
  it('elimina por ID', () => {
    s.eliminar(4).subscribe();
    const r = http.expectOne('/api/v1/roles/4');
    expect(r.request.method).toBe('DELETE');
    r.flush(null);
  });
});
