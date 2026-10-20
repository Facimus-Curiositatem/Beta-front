import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ProcesoService } from './proceso.service';
import { ProcesoResponse } from '../models/proceso-response';
import { PageResponse } from '../models/page-response';
import { ProcesoDetalleResponse } from '../models/proceso-detalle-response';
import { HistorialCambioResponse } from '../models/historial-cambio-response';
import { environment } from '../../environments/environment';

describe('ProcesoService', () => {
  let service: ProcesoService;
  let http: HttpTestingController;
  const api = `${environment.apiUrl}/procesos`;

  const proceso: ProcesoResponse = {
    id: 1, nombre: 'Compras', descripcion: 'Proceso de compras', categoria: 'Finanzas',
    estado: 'BORRADOR', activo: true,
    fechaCreacion: '2026-01-01T00:00:00', fechaModificacion: '2026-01-02T00:00:00'
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });
    service = TestBed.inject(ProcesoService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('buscar envia los filtros y la pagina como query params', () => {
    const page: PageResponse<ProcesoResponse> = {
      content: [proceso], page: 2, size: 10, totalElements: 21, totalPages: 3
    };
    let resultado: PageResponse<ProcesoResponse> | undefined;
    service.buscar('comp', 'BORRADOR', 'Finanzas', true, 2).subscribe(d => resultado = d);

    const req = http.expectOne(r => r.url === api);
    expect(req.request.method).toBe('GET');
    expect(req.request.params.get('nombre')).toBe('comp');
    expect(req.request.params.get('estado')).toBe('BORRADOR');
    expect(req.request.params.get('categoria')).toBe('Finanzas');
    expect(req.request.params.get('activo')).toBe('true');
    expect(req.request.params.get('pagina')).toBe('2');
    req.flush(page);
    expect(resultado).toEqual(page);
  });

  it('buscar omite los filtros vacios y usa pagina 0 por defecto', () => {
    service.buscar().subscribe();
    const req = http.expectOne(r => r.url === api);
    expect(req.request.params.keys()).toEqual(['pagina']);
    expect(req.request.params.get('pagina')).toBe('0');
    req.flush({ content: [], page: 0, size: 10, totalElements: 0, totalPages: 0 });
  });

  it('obtener hace GET /procesos/{id}', () => {
    const detalle: ProcesoDetalleResponse = { proceso, historial: [] };
    let resultado: ProcesoDetalleResponse | undefined;
    service.obtener(1).subscribe(d => resultado = d);
    http.expectOne(`${api}/1`).flush(detalle);
    expect(resultado).toEqual(detalle);
  });

  it('crear hace POST /procesos', () => {
    const request = { nombre: 'Nuevo', descripcion: 'Desc', categoria: 'RRHH' };
    service.crear(request).subscribe();
    const req = http.expectOne(api);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(request);
    req.flush(proceso);
  });

  it('editar hace PUT /procesos/{id}', () => {
    const request = { nombre: 'Editado', descripcion: 'Desc', categoria: 'RRHH' };
    service.editar(1, request).subscribe();
    const req = http.expectOne(`${api}/1`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(request);
    req.flush(proceso);
  });

  it('cambiarEstado hace PATCH /procesos/{id}', () => {
    service.cambiarEstado(1, { estado: 'PUBLICADO' }).subscribe();
    const req = http.expectOne(`${api}/1`);
    expect(req.request.method).toBe('PATCH');
    expect(req.request.body).toEqual({ estado: 'PUBLICADO' });
    req.flush({ ...proceso, estado: 'PUBLICADO' });
  });

  it('eliminar hace DELETE /procesos/{id}', () => {
    let llamado = false;
    service.eliminar(1).subscribe(() => llamado = true);
    const req = http.expectOne(`${api}/1`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
    expect(llamado).toBeTrue();
  });

  it('obtenerHistorial hace GET /procesos/{id}/historial', () => {
    const historial: HistorialCambioResponse[] = [
      { id: 1, fechaCambio: '2026-01-02T00:00:00', descripcionCambio: 'Creado', autorNombre: 'Ana' }
    ];
    let resultado: HistorialCambioResponse[] = [];
    service.obtenerHistorial(1).subscribe(d => resultado = d);
    http.expectOne(`${api}/1/historial`).flush(historial);
    expect(resultado).toEqual(historial);
  });

  it('obtenerDiagrama hace GET /procesos/{id}/diagrama', () => {
    service.obtenerDiagrama(1).subscribe();
    const req = http.expectOne(`${api}/1/diagrama`);
    expect(req.request.method).toBe('GET');
    req.flush({});
  });
});
