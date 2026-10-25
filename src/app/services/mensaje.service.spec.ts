import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { MensajeService } from './mensaje.service';
import { EditarMensajeRequest, MensajeRequest, MensajeResponse } from '../models/mensaje.model';
import { environment } from '../../environments/environment';

describe('MensajeService', () => {
  let service: MensajeService;
  let http: HttpTestingController;
  const api = environment.apiUrl;

  const mensaje: MensajeResponse = {
    id: 1, nombre: 'Pedido', contenido: 'Datos del pedido', poolOrigenId: 2, poolDestinoId: 3, procesoId: 7,
    eventoThrowId: 10, eventoCatchId: 11, claveCorrelacion: 'pedidoId', tipoDestinoExterno: 'CORREO',
    destinoExterno: 'a@b.com', politicaFalloNotificacion: 'CONTINUAR_FLUJO', actividadErrorId: 0,
    politicaSinCaso: 'DESCARTAR', sinReceptor: false
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });
    service = TestBed.inject(MensajeService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('listar hace GET /procesos/{id}/mensajes', () => {
    let resultado: MensajeResponse[] = [];
    service.listar(7).subscribe(data => resultado = data);
    const req = http.expectOne(`${api}/procesos/7/mensajes`);
    expect(req.request.method).toBe('GET');
    req.flush([mensaje]);
    expect(resultado).toEqual([mensaje]);
  });

  it('obtener hace GET /mensajes/{id}', () => {
    let resultado: MensajeResponse | undefined;
    service.obtener(1).subscribe(data => resultado = data);
    const req = http.expectOne(`${api}/mensajes/1`);
    expect(req.request.method).toBe('GET');
    req.flush(mensaje);
    expect(resultado).toEqual(mensaje);
  });

  it('crear hace POST /procesos/{id}/mensajes', () => {
    const request: MensajeRequest = {
      nombre: 'Pedido', contenido: 'Datos del pedido', poolOrigenId: 2, poolDestinoId: 3, eventoThrowId: 10
    };
    let resultado: MensajeResponse | undefined;
    service.crear(7, request).subscribe(data => resultado = data);
    const req = http.expectOne(`${api}/procesos/7/mensajes`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(request);
    req.flush(mensaje);
    expect(resultado).toEqual(mensaje);
  });

  it('editar hace PUT /mensajes/{id}', () => {
    const request: EditarMensajeRequest = { nombre: 'Editado', contenido: 'Nuevo contenido' };
    let resultado: MensajeResponse | undefined;
    service.editar(1, request).subscribe(data => resultado = data);
    const req = http.expectOne(`${api}/mensajes/1`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(request);
    req.flush(mensaje);
    expect(resultado).toEqual(mensaje);
  });

  it('eliminar hace DELETE /mensajes/{id}', () => {
    let llamado = false;
    service.eliminar(1).subscribe(() => llamado = true);
    const req = http.expectOne(`${api}/mensajes/1`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
    expect(llamado).toBeTrue();
  });
});
