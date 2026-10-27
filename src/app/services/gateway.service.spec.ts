import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { GatewayService } from './gateway.service';
import { GatewayRequest, GatewayResponse } from '../models/gateway.model';
import { ImpactoEliminacionResponse } from '../models/impacto-eliminacion.model';
import { environment } from '../../environments/environment';

describe('GatewayService', () => {
  let service: GatewayService;
  let http: HttpTestingController;
  const api = environment.apiUrl;

  const gateway: GatewayResponse = {
    id: 1, nombre: 'Aprobado?', tipoGateway: 'EXCLUSIVO',
    posicionX: 10, posicionY: 20, laneId: 5
  };

  const request: GatewayRequest = {
    nombre: 'Aprobado?', tipoGateway: 'EXCLUSIVO', posicionX: 10, posicionY: 20
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });
    service = TestBed.inject(GatewayService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('listar hace GET /lanes/{id}/gateways', () => {
    let resultado: GatewayResponse[] = [];
    service.listar(5).subscribe(data => resultado = data);
    const req = http.expectOne(`${api}/lanes/5/gateways`);
    expect(req.request.method).toBe('GET');
    req.flush([gateway]);
    expect(resultado).toEqual([gateway]);
  });

  it('obtener hace GET /gateways/{id}', () => {
    let resultado: GatewayResponse | undefined;
    service.obtener(1).subscribe(data => resultado = data);
    const req = http.expectOne(`${api}/gateways/1`);
    expect(req.request.method).toBe('GET');
    req.flush(gateway);
    expect(resultado).toEqual(gateway);
  });

  it('crear hace POST /lanes/{id}/gateways', () => {
    let resultado: GatewayResponse | undefined;
    service.crear(5, request).subscribe(data => resultado = data);
    const req = http.expectOne(`${api}/lanes/5/gateways`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(request);
    req.flush(gateway);
    expect(resultado).toEqual(gateway);
  });

  it('editar hace PUT /gateways/{id}', () => {
    let resultado: GatewayResponse | undefined;
    service.editar(1, request).subscribe(data => resultado = data);
    const req = http.expectOne(`${api}/gateways/1`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(request);
    req.flush(gateway);
    expect(resultado).toEqual(gateway);
  });

  it('evaluarImpacto hace GET /gateways/{id}/impacto-eliminacion', () => {
    const impacto: ImpactoEliminacionResponse = {
      requiereConfirmacion: false,
      rompeContinuidad: false,
      advertencias: []
    };
    let resultado: ImpactoEliminacionResponse | undefined;
    service.evaluarImpacto(1).subscribe(data => resultado = data);
    const req = http.expectOne(`${api}/gateways/1/impacto-eliminacion`);
    expect(req.request.method).toBe('GET');
    req.flush(impacto);
    expect(resultado).toEqual(impacto);
  });

  it('eliminar hace DELETE /gateways/{id}', () => {
    let llamado = false;
    service.eliminar(1).subscribe(() => llamado = true);
    const req = http.expectOne(`${api}/gateways/1`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
    expect(llamado).toBeTrue();
  });
});