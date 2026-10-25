import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { EventoMensajeService } from './evento-mensaje.service';
import { EventoMensajeRequest, EventoMensajeResponse } from '../models/evento-mensaje.model';
import { environment } from '../../environments/environment';

describe('EventoMensajeService', () => {
  let service: EventoMensajeService;
  let http: HttpTestingController;
  const api = environment.apiUrl;

  const evento: EventoMensajeResponse = {
    id: 1, nombre: 'Enviar pedido', tipoEvento: 'THROW', contenido: 'Pedido', claveCorrelacion: 'pedidoId',
    posicionX: 10, posicionY: 20, laneId: 3, origenExterno: false
  };

  const request: EventoMensajeRequest = {
    nombre: 'Enviar pedido', tipoEvento: 'THROW', contenido: 'Pedido', claveCorrelacion: 'pedidoId',
    posicionX: 10, posicionY: 20, origenExterno: false
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });
    service = TestBed.inject(EventoMensajeService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('crear hace POST /lanes/{id}/eventos-mensaje', () => {
    let resultado: EventoMensajeResponse | undefined;
    service.crear(3, request).subscribe(data => resultado = data);
    const req = http.expectOne(`${api}/lanes/3/eventos-mensaje`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(request);
    req.flush(evento);
    expect(resultado).toEqual(evento);
  });

  it('obtener hace GET /eventos-mensaje/{id}', () => {
    let resultado: EventoMensajeResponse | undefined;
    service.obtener(1).subscribe(data => resultado = data);
    const req = http.expectOne(`${api}/eventos-mensaje/1`);
    expect(req.request.method).toBe('GET');
    req.flush(evento);
    expect(resultado).toEqual(evento);
  });

  it('listar hace GET /lanes/{id}/eventos-mensaje', () => {
    let resultado: EventoMensajeResponse[] = [];
    service.listar(3).subscribe(data => resultado = data);
    const req = http.expectOne(`${api}/lanes/3/eventos-mensaje`);
    expect(req.request.method).toBe('GET');
    req.flush([evento]);
    expect(resultado).toEqual([evento]);
  });

  it('editar hace PUT /eventos-mensaje/{id}', () => {
    let resultado: EventoMensajeResponse | undefined;
    service.editar(1, request).subscribe(data => resultado = data);
    const req = http.expectOne(`${api}/eventos-mensaje/1`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(request);
    req.flush(evento);
    expect(resultado).toEqual(evento);
  });

  it('eliminar hace DELETE /eventos-mensaje/{id}', () => {
    let llamado = false;
    service.eliminar(1).subscribe(() => llamado = true);
    const req = http.expectOne(`${api}/eventos-mensaje/1`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
    expect(llamado).toBeTrue();
  });
});
