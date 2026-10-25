import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { CorrelacionService } from './correlacion.service';
import { CorrelacionResponse } from '../models/correlacion.model';
import { environment } from '../../environments/environment';

describe('CorrelacionService', () => {
  let service: CorrelacionService;
  let http: HttpTestingController;
  const api = environment.apiUrl;

  const correlacion: CorrelacionResponse = { id: 1, criterio: 'pedidoId', mensajeId: 9 };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });
    service = TestBed.inject(CorrelacionService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('obtener hace GET /mensajes/{id}/correlacion', () => {
    let resultado: CorrelacionResponse | undefined;
    service.obtener(9).subscribe(data => resultado = data);
    const req = http.expectOne(`${api}/mensajes/9/correlacion`);
    expect(req.request.method).toBe('GET');
    req.flush(correlacion);
    expect(resultado).toEqual(correlacion);
  });

  it('definir hace PUT /mensajes/{id}/correlacion', () => {
    const request = { criterio: 'pedidoId' };
    let resultado: CorrelacionResponse | undefined;
    service.definir(9, request).subscribe(data => resultado = data);
    const req = http.expectOne(`${api}/mensajes/9/correlacion`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(request);
    req.flush(correlacion);
    expect(resultado).toEqual(correlacion);
  });

  it('eliminar hace DELETE /mensajes/{id}/correlacion', () => {
    let llamado = false;
    service.eliminar(9).subscribe(() => llamado = true);
    const req = http.expectOne(`${api}/mensajes/9/correlacion`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
    expect(llamado).toBeTrue();
  });
});
