import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { NodoFlujoService } from './nodo-flujo.service';
import { NodoFlujo } from '../models/nodo-flujo.model';
import { environment } from '../../environments/environment';

describe('NodoFlujoService', () => {
  let service: NodoFlujoService;
  let http: HttpTestingController;
  const api = environment.apiUrl;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });
    service = TestBed.inject(NodoFlujoService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('listarPorPool junta actividades, gateways y eventos de cada lane', () => {
    let resultado: NodoFlujo[] = [];
    service.listarPorPool(2).subscribe(data => resultado = data);

    http.expectOne(`${api}/pools/2/lanes`).flush([
      { id: 8, nombre: 'Ventas', orden: 0, poolId: 2, rolProcesoId: 1, rolProcesoNombre: 'Vendedor' }
    ]);
    http.expectOne(`${api}/lanes/8/actividades`).flush([{ id: 1, nombre: 'Revisar' }]);
    http.expectOne(`${api}/lanes/8/gateways`).flush([{ id: 2, nombre: 'Aprobado?' }]);
    http.expectOne(`${api}/lanes/8/eventos-mensaje`).flush([{ id: 3, nombre: 'Enviar' }]);

    expect(resultado).toEqual([
      { id: 1, nombre: 'Revisar', tipo: 'ACTIVIDAD' },
      { id: 2, nombre: 'Aprobado?', tipo: 'GATEWAY' },
      { id: 3, nombre: 'Enviar', tipo: 'EVENTO_MENSAJE' }
    ]);
  });

  it('listarPorPool devuelve lista vacia si el pool no tiene lanes', () => {
    let resultado: NodoFlujo[] | undefined;
    service.listarPorPool(2).subscribe(data => resultado = data);
    http.expectOne(`${api}/pools/2/lanes`).flush([]);
    expect(resultado).toEqual([]);
  });
});
