import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { InvitacionService } from './invitacion.service';
import { API_URL } from '../config/api.config';

describe('InvitacionService', () => {
  let service: InvitacionService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(InvitacionService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('create() hace POST /usuarios/invitaciones', () => {
    const body = { email: 'nuevo@correo.com', rolAcceso: 'EDITOR' as const };
    const respuesta = { id: 1, ...body, token: 'abc123', fechaExpiracion: '2026-10-24T12:00:00' };

    service.create(body).subscribe(r => expect(r.token).toBe('abc123'));
    const req = http.expectOne(`${API_URL}/usuarios/invitaciones`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(body);
    req.flush(respuesta);
  });

  it('accept() hace POST /usuarios/invitaciones/:token/aceptar', () => {
    const body = { nombre: 'Ana', password: '12345678' };
    service.accept('abc123', body).subscribe();
    const req = http.expectOne(`${API_URL}/usuarios/invitaciones/abc123/aceptar`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(body);
    req.flush({ id: 2, nombre: 'Ana', email: 'nuevo@correo.com', rolAcceso: 'EDITOR', activo: true });
  });
});