import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { UsuarioService } from './usuario.service';
import { API_URL } from '../config/api.config';
import { Usuario } from '../models/usuario';

describe('UsuarioService', () => {
  let service: UsuarioService;
  let http: HttpTestingController;
  const usuario: Usuario = { id: 1, nombre: 'Juan', email: 'juan@correo.com', rolAcceso: 'EDITOR', activo: true };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(UsuarioService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('list() hace GET /usuarios', () => {
    service.list().subscribe(r => expect(r).toEqual([usuario]));
    const req = http.expectOne(`${API_URL}/usuarios`);
    expect(req.request.method).toBe('GET');
    req.flush([usuario]);
  });

  it('get() hace GET /usuarios/:id', () => {
    service.get(1).subscribe(r => expect(r).toEqual(usuario));
    const req = http.expectOne(`${API_URL}/usuarios/1`);
    expect(req.request.method).toBe('GET');
    req.flush(usuario);
  });

  it('create() hace POST con el request en el cuerpo', () => {
    const body = { nombre: 'Juan', email: 'juan@correo.com', password: '123456', rolAcceso: 'EDITOR' as const };
    service.create(body).subscribe(r => expect(r).toEqual(usuario));
    const req = http.expectOne(`${API_URL}/usuarios`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(body);
    req.flush(usuario);
  });

  it('update() hace PATCH /usuarios/:id', () => {
    service.update(1, { activo: false }).subscribe();
    const req = http.expectOne(`${API_URL}/usuarios/1`);
    expect(req.request.method).toBe('PATCH');
    expect(req.request.body).toEqual({ activo: false });
    req.flush({ ...usuario, activo: false });
  });

  it('delete() hace DELETE /usuarios/:id', () => {
    service.delete(1).subscribe();
    const req = http.expectOne(`${API_URL}/usuarios/1`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null, { status: 204, statusText: 'No Content' });
  });
});