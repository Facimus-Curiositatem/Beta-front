import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ActividadService } from './actividad.service';
import { ActividadRequest, ActividadResponse } from '../models/actividad.model';
import { ImpactoEliminacionResponse } from '../models/impacto-eliminacion.model';
import { environment } from '../../environments/environment';

describe('ActividadService', () => {
  let service: ActividadService;
  let http: HttpTestingController;
  const api = environment.apiUrl;

  const actividad: ActividadResponse = {
    id: 1, nombre: 'Revisar solicitud', descripcion: null,
    posicionX: 10, posicionY: 20, laneId: 5, tipoActividad: 'TAREA'
  };

  const request: ActividadRequest = {
    nombre: 'Revisar solicitud', descripcion: '', posicionX: 10, posicionY: 20, tipoActividad: 'TAREA'
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });
    service = TestBed.inject(ActividadService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('listar hace GET /lanes/{id}/actividades', () => {
    let resultado: ActividadResponse[] = [];
    service.listar(5).subscribe(data => resultado = data);
    const req = http.expectOne(`${api}/lanes/5/actividades`);
    expect(req.request.method).toBe('GET');
    req.flush([actividad]);
    expect(resultado).toEqual([actividad]);
  });

  it('obtener hace GET /actividades/{id}', () => {
    let resultado: ActividadResponse | undefined;
    service.obtener(1).subscribe(data => resultado = data);
    const req = http.expectOne(`${api}/actividades/1`);
    expect(req.request.method).toBe('GET');
    req.flush(actividad);
    expect(resultado).toEqual(actividad);
  });

  it('crear hace POST /lanes/{id}/actividades', () => {
    let resultado: ActividadResponse | undefined;
    service.crear(5, request).subscribe(data => resultado = data);
    const req = http.expectOne(`${api}/lanes/5/actividades`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(request);
    req.flush(actividad);
    expect(resultado).toEqual(actividad);
  });

  it('editar hace PUT /actividades/{id}', () => {
    let resultado: ActividadResponse | undefined;
    service.editar(1, request).subscribe(data => resultado = data);
    const req = http.expectOne(`${api}/actividades/1`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(request);
    req.flush(actividad);
    expect(resultado).toEqual(actividad);
  });

  it('evaluarImpacto hace GET /actividades/{id}/impacto-eliminacion', () => {
    const impacto: ImpactoEliminacionResponse = {
      requiereConfirmacion: true,
      rompeContinuidad: true,
      advertencias: ['El nodo Inicio quedara sin salida.']
    };
    let resultado: ImpactoEliminacionResponse | undefined;
    service.evaluarImpacto(1).subscribe(data => resultado = data);
    const req = http.expectOne(`${api}/actividades/1/impacto-eliminacion`);
    expect(req.request.method).toBe('GET');
    req.flush(impacto);
    expect(resultado).toEqual(impacto);
  });

  it('eliminar hace DELETE /actividades/{id}', () => {
    let llamado = false;
    service.eliminar(1).subscribe(() => llamado = true);
    const req = http.expectOne(`${api}/actividades/1`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
    expect(llamado).toBeTrue();
  });
});