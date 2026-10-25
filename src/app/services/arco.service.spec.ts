import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ArcoService } from './arco.service';
import { ArcoResponse } from '../models/arco.model';
import { ImpactoEliminacionResponse } from '../models/impacto-eliminacion.model';
import { environment } from '../../environments/environment';

describe('ArcoService', () => {
  let service: ArcoService;
  let http: HttpTestingController;
  const api = environment.apiUrl;

  const arco: ArcoResponse = { id: 1, etiqueta: 'Si', condicion: 'monto > 100', origenId: 4, destinoId: 5, poolId: 2 };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });
    service = TestBed.inject(ArcoService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('crear hace POST /arcos', () => {
    const request = { origenId: 4, destinoId: 5, etiqueta: 'Si' };
    let resultado: ArcoResponse | undefined;
    service.crear(request).subscribe(data => resultado = data);
    const req = http.expectOne(`${api}/arcos`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(request);
    req.flush(arco);
    expect(resultado).toEqual(arco);
  });

  it('obtener hace GET /arcos/{id}', () => {
    let resultado: ArcoResponse | undefined;
    service.obtener(1).subscribe(data => resultado = data);
    const req = http.expectOne(`${api}/arcos/1`);
    expect(req.request.method).toBe('GET');
    req.flush(arco);
    expect(resultado).toEqual(arco);
  });

  it('listar hace GET /pools/{id}/arcos', () => {
    let resultado: ArcoResponse[] = [];
    service.listar(2).subscribe(data => resultado = data);
    const req = http.expectOne(`${api}/pools/2/arcos`);
    expect(req.request.method).toBe('GET');
    req.flush([arco]);
    expect(resultado).toEqual([arco]);
  });

  it('editar hace PUT /arcos/{id}', () => {
    const request = { etiqueta: 'No', condicion: 'monto <= 100' };
    let resultado: ArcoResponse | undefined;
    service.editar(1, request).subscribe(data => resultado = data);
    const req = http.expectOne(`${api}/arcos/1`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(request);
    req.flush(arco);
    expect(resultado).toEqual(arco);
  });

  it('evaluarImpacto hace GET /arcos/{id}/impacto-eliminacion', () => {
    const impacto: ImpactoEliminacionResponse = {
      requiereConfirmacion: true, rompeContinuidad: true, advertencias: ['El nodo quedara aislado']
    };
    let resultado: ImpactoEliminacionResponse | undefined;
    service.evaluarImpacto(1).subscribe(data => resultado = data);
    const req = http.expectOne(`${api}/arcos/1/impacto-eliminacion`);
    expect(req.request.method).toBe('GET');
    req.flush(impacto);
    expect(resultado).toEqual(impacto);
  });

  it('eliminar hace DELETE /arcos/{id}', () => {
    let llamado = false;
    service.eliminar(1).subscribe(() => llamado = true);
    const req = http.expectOne(`${api}/arcos/1`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
    expect(llamado).toBeTrue();
  });
});
