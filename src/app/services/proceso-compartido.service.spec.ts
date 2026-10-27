import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { ProcesoCompartidoService } from './proceso-compartido.service';
describe('ProcesoCompartidoService', () => {
  let s: ProcesoCompartidoService;
  let http: HttpTestingController;
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });
    s = TestBed.inject(ProcesoCompartidoService);
    http = TestBed.inject(HttpTestingController);
  });
  afterEach(() => http.verify());
  it('lista invitados de un proceso', () => {
    s.listarCompartidosPorMi(10).subscribe();
    const r = http.expectOne('/api/v1/procesos/10/compartidos');
    expect(r.request.method).toBe('GET');
    r.flush([]);
  });
  it('comparte por ID de empresa invitada', () => {
    s.compartir(10, { empresaInvitadaId: 8 }).subscribe();
    const r = http.expectOne('/api/v1/procesos/10/compartidos');
    expect(r.request.method).toBe('POST');
    expect(r.request.body).toEqual({ empresaInvitadaId: 8 });
    r.flush({});
  });
  it('revoca con ID de empresa invitada', () => {
    s.revocar(10, 8).subscribe();
    const r = http.expectOne('/api/v1/procesos/10/compartidos/8');
    expect(r.request.method).toBe('DELETE');
    r.flush(null);
  });
  it('lista recibidos', () => {
    s.listarCompartidosConmigo().subscribe();
    const r = http.expectOne('/api/v1/procesos-compartidos');
    expect(r.request.method).toBe('GET');
    r.flush([]);
  });
  it('consulta detalle por procesoId', () => {
    s.verDetalle(10).subscribe();
    const r = http.expectOne('/api/v1/procesos-compartidos/10');
    expect(r.request.method).toBe('GET');
    r.flush({});
  });
});
