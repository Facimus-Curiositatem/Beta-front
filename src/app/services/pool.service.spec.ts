import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { PoolService } from './pool.service';
import { PoolResponse } from '../models/pool.model';
import { environment } from '../../environments/environment';

describe('PoolService', () => {
  let service: PoolService;
  let http: HttpTestingController;
  const api = environment.apiUrl;

  const pool: PoolResponse = {
    id: 1, nombre: 'Empresa', tipoParticipante: 'EMPRESA',
    cajaNegra: false, orden: 0, procesoId: 10
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });
    service = TestBed.inject(PoolService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('listar hace GET /procesos/{id}/pools', () => {
    let resultado: PoolResponse[] = [];
    service.listar(10).subscribe(data => resultado = data);
    http.expectOne(`${api}/procesos/10/pools`).flush([pool]);
    expect(resultado).toEqual([pool]);
  });

  it('obtener hace GET /pools/{id}', () => {
    let resultado: PoolResponse | undefined;
    service.obtener(1).subscribe(data => resultado = data);
    http.expectOne(`${api}/pools/1`).flush(pool);
    expect(resultado).toEqual(pool);
  });

  it('crear hace POST /procesos/{id}/pools', () => {
    const request = { nombre: 'Nuevo', tipoParticipante: 'CLIENTE', cajaNegra: false };
    let resultado: PoolResponse | undefined;
    service.crear(10, request).subscribe(data => resultado = data);
    const req = http.expectOne(`${api}/procesos/10/pools`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(request);
    req.flush(pool);
    expect(resultado).toEqual(pool);
  });

  it('editar hace PUT /pools/{id}', () => {
    const request = { nombre: 'Editado', tipoParticipante: 'EMPRESA' };
    let resultado: PoolResponse | undefined;
    service.editar(1, request).subscribe(data => resultado = data);
    const req = http.expectOne(`${api}/pools/1`);
    expect(req.request.method).toBe('PUT');
    req.flush(pool);
    expect(resultado).toEqual(pool);
  });

  it('eliminar hace DELETE /pools/{id}', () => {
    let llamado = false;
    service.eliminar(1).subscribe(() => llamado = true);
    const req = http.expectOne(`${api}/pools/1`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
    expect(llamado).toBeTrue();
  });
});
