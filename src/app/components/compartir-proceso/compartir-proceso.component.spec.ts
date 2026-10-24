import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { CompartirProcesoComponent } from './compartir-proceso.component';
import { compartido } from '../../testing/compartidos.fixture';
describe('CompartirProcesoComponent', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      imports: [CompartirProcesoComponent],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()]
    })
  );
  afterEach(() => TestBed.inject(HttpTestingController).verify());
  function setup() {
    const f = TestBed.createComponent(CompartirProcesoComponent);
    f.componentRef.setInput('id', '10');
    f.detectChanges();
    TestBed.inject(HttpTestingController)
      .expectOne('/api/v1/procesos/10/compartidos')
      .flush([compartido]);
    f.detectChanges();
    return f;
  }
  it('muestra invitados y rechaza IDs inválidos', () => {
    const f = setup();
    expect(f.nativeElement.textContent).toContain('Aliada');
    for (const id of [0, -1, 1.5]) {
      f.componentInstance.form.setValue({ empresaInvitadaId: id });
      f.componentInstance.compartir();
      expect(f.componentInstance.form.invalid).toBeTrue();
    }
    TestBed.inject(HttpTestingController).expectNone('/api/v1/procesos/10/compartidos');
  });
  it('comparte una vez y actualiza lista', () => {
    const f = setup();
    f.componentInstance.form.setValue({ empresaInvitadaId: 9 });
    f.componentInstance.compartir();
    f.componentInstance.compartir();
    const http = TestBed.inject(HttpTestingController);
    const r = http.expectOne('/api/v1/procesos/10/compartidos');
    expect(r.request.body.empresaInvitadaId).toBe(9);
    r.flush(compartido);
    http.expectOne('/api/v1/procesos/10/compartidos').flush([compartido]);
    expect(f.componentInstance.saving()).toBeFalse();
  });
  it('revoca por empresaInvitadaId y no por id del compartido', () => {
    spyOn(window, 'confirm').and.returnValue(true);
    const f = setup();
    f.componentInstance.revocar(compartido);
    const http = TestBed.inject(HttpTestingController);
    const r = http.expectOne('/api/v1/procesos/10/compartidos/8');
    expect(r.request.method).toBe('DELETE');
    r.flush(null);
    http.expectOne('/api/v1/procesos/10/compartidos').flush([]);
    expect(f.componentInstance.compartidos()).toEqual([]);
  });
  it('muestra error de negocio al compartir', () => {
    const f = setup();
    f.componentInstance.form.setValue({ empresaInvitadaId: 8 });
    f.componentInstance.compartir();
    TestBed.inject(HttpTestingController)
      .expectOne('/api/v1/procesos/10/compartidos')
      .flush({ detail: 'Ya compartido' }, { status: 409, statusText: 'Conflict' });
    expect(f.componentInstance.message()).toBe('Ya compartido');
    expect(f.componentInstance.saving()).toBeFalse();
  });
  it('recarga al cambiar el ID sin recrear la pantalla', () => {
    const f = TestBed.createComponent(CompartirProcesoComponent);
    f.componentRef.setInput('id', '9');
    f.detectChanges();
    const http = TestBed.inject(HttpTestingController);
    http.expectOne('/api/v1/procesos/9/compartidos').flush([]);
    f.componentRef.setInput('id', '12');
    f.detectChanges();
    const req = http.expectOne('/api/v1/procesos/12/compartidos');
    req.flush([]);
    expect(f.componentInstance.id()).toBe('12');
  });
  it('limpia error después de recuperar la lista', () => {
    const f = TestBed.createComponent(CompartirProcesoComponent);
    f.componentRef.setInput('id', '10');
    f.detectChanges();
    const http = TestBed.inject(HttpTestingController);
    http
      .expectOne('/api/v1/procesos/10/compartidos')
      .flush({ detail: 'Error de carga' }, { status: 500, statusText: 'Error' });
    f.componentInstance.cargar();
    http.expectOne('/api/v1/procesos/10/compartidos').flush([]);
    expect(f.componentInstance.message()).toBe('');
  });
});
