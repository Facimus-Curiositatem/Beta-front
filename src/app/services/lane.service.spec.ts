import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { LaneService } from './lane.service';
import { LaneResponse } from '../models/lane.model';
import { environment } from '../../environments/environment';

describe('LaneService', () => {
  let service: LaneService;
  let http: HttpTestingController;
  const api = environment.apiUrl;

  const lane: LaneResponse = {
    id: 1, nombre: 'Ventas', orden: 0, poolId: 5,
    rolProcesoId: 2, rolProcesoNombre: 'Vendedor'
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });
    service = TestBed.inject(LaneService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('listar hace GET /pools/{id}/lanes', () => {
    let resultado: LaneResponse[] = [];
    service.listar(5).subscribe(data => resultado = data);
    http.expectOne(`${api}/pools/5/lanes`).flush([lane]);
    expect(resultado).toEqual([lane]);
  });

  it('obtener hace GET /lanes/{id}', () => {
    let resultado: LaneResponse | undefined;
    service.obtener(1).subscribe(data => resultado = data);
    http.expectOne(`${api}/lanes/1`).flush(lane);
    expect(resultado).toEqual(lane);
  });

  it('crear hace POST /pools/{id}/lanes', () => {
    const request = { nombre: 'Nuevo', rolProcesoId: 2 };
    let resultado: LaneResponse | undefined;
    service.crear(5, request).subscribe(data => resultado = data);
    const req = http.expectOne(`${api}/pools/5/lanes`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(request);
    req.flush(lane);
    expect(resultado).toEqual(lane);
  });

  it('editar hace PUT /lanes/{id}', () => {
    const request = { nombre: 'Editado', rolProcesoId: 3 };
    let resultado: LaneResponse | undefined;
    service.editar(1, request).subscribe(data => resultado = data);
    const req = http.expectOne(`${api}/lanes/1`);
    expect(req.request.method).toBe('PUT');
    req.flush(lane);
    expect(resultado).toEqual(lane);
  });

  it('reordenar hace PATCH /pools/{id}/lanes/orden', () => {
    const request = { laneIds: [3, 1, 2] };
    let resultado: LaneResponse[] = [];
    service.reordenar(5, request).subscribe(data => resultado = data);
    const req = http.expectOne(`${api}/pools/5/lanes/orden`);
    expect(req.request.method).toBe('PATCH');
    expect(req.request.body).toEqual(request);
    req.flush([lane]);
    expect(resultado).toEqual([lane]);
  });

  it('eliminar hace DELETE /lanes/{id}', () => {
    let llamado = false;
    service.eliminar(1).subscribe(() => llamado = true);
    const req = http.expectOne(`${api}/lanes/1`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
    expect(llamado).toBeTrue();
  });
});
