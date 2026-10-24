import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { RegistroEmpresaComponent } from './registro-empresa.component';

describe('RegistroEmpresaComponent y EmpresaService', () => {
  const body = {
    nombreEmpresa: 'Beta',
    nit: '123',
    correoContacto: 'beta@beta.co',
    nombreAdmin: 'Sam',
    emailAdmin: 'sam@beta.co',
    passwordAdmin: '123456'
  };
  beforeEach(() =>
    TestBed.configureTestingModule({
      imports: [RegistroEmpresaComponent],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()]
    })
  );
  afterEach(() => TestBed.inject(HttpTestingController).verify());
  it('valida email y contraseña corta sin enviar HTTP', () => {
    const f = TestBed.createComponent(RegistroEmpresaComponent);
    f.componentInstance.form.setValue({ ...body, emailAdmin: 'mal', passwordAdmin: '123' });
    f.componentInstance.submit();
    expect(f.componentInstance.form.invalid).toBeTrue();
    TestBed.inject(HttpTestingController).expectNone('/api/v1/empresas');
  });
  it('registra con body exacto y navega a login', () => {
    const f = TestBed.createComponent(RegistroEmpresaComponent);
    const nav = spyOn(TestBed.inject(Router), 'navigate').and.resolveTo(true);
    f.componentInstance.form.setValue(body);
    f.componentInstance.submit();
    f.componentInstance.submit();
    const req = TestBed.inject(HttpTestingController).expectOne('/api/v1/empresas');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(body);
    req.flush({ id: 1 });
    expect(nav).toHaveBeenCalledWith(['/login']);
  });
  it('muestra conflicto y desbloquea guardar', () => {
    const f = TestBed.createComponent(RegistroEmpresaComponent);
    f.componentInstance.form.setValue(body);
    f.componentInstance.submit();
    TestBed.inject(HttpTestingController)
      .expectOne('/api/v1/empresas')
      .flush({ detail: 'NIT registrado' }, { status: 409, statusText: 'Conflict' });
    f.detectChanges();
    expect(f.nativeElement.textContent).toContain('NIT registrado');
    expect(f.componentInstance.saving()).toBeFalse();
  });
});
