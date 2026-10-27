import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { ProcesoCompartidoDetalleComponent } from './proceso-compartido-detalle.component';
import { detalleCompartido } from '../../testing/compartidos.fixture';
describe('ProcesoCompartidoDetalleComponent', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      imports: [ProcesoCompartidoDetalleComponent],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()]
    })
  );
  afterEach(() => TestBed.inject(HttpTestingController).verify());
  it('muestra todas las colecciones sin formularios ni acciones de escritura', () => {
    const f = TestBed.createComponent(ProcesoCompartidoDetalleComponent);
    f.componentRef.setInput('id', '10');
    f.detectChanges();
    TestBed.inject(HttpTestingController)
      .expectOne('/api/v1/procesos-compartidos/10')
      .flush(detalleCompartido);
    f.detectChanges();
    for (const text of [
      'Compra',
      'Pool Beta',
      'Lane ventas',
      'Cotizar',
      'Aprobación',
      'Solicitud',
      'Sí aprobado',
      'Avisar'
    ])
      expect(f.nativeElement.textContent).toContain(text);
    expect(f.nativeElement.querySelectorAll('form,input,textarea').length).toBe(0);
    expect(f.nativeElement.querySelectorAll('button').length).toBe(1);
  });
  it('borra detalle y muestra revocación al recargar', () => {
    const f = TestBed.createComponent(ProcesoCompartidoDetalleComponent);
    f.componentRef.setInput('id', '10');
    f.detectChanges();
    const http = TestBed.inject(HttpTestingController);
    http.expectOne('/api/v1/procesos-compartidos/10').flush(detalleCompartido);
    f.componentInstance.cargar();
    http
      .expectOne('/api/v1/procesos-compartidos/10')
      .flush({ detail: 'Acceso revocado' }, { status: 404, statusText: 'Not Found' });
    f.detectChanges();
    expect(f.componentInstance.detalle()).toBeNull();
    expect(f.nativeElement.textContent).toContain('Acceso revocado');
  });
  it('recarga al cambiar el ID sin recrear la pantalla', () => {
    const f = TestBed.createComponent(ProcesoCompartidoDetalleComponent);
    f.componentRef.setInput('id', '9');
    f.detectChanges();
    const http = TestBed.inject(HttpTestingController);
    http.expectOne('/api/v1/procesos-compartidos/9').flush(detalleCompartido);
    f.componentRef.setInput('id', '12');
    f.detectChanges();
    const req = http.expectOne('/api/v1/procesos-compartidos/12');
    req.flush(detalleCompartido);
    expect(f.componentInstance.id()).toBe('12');
  });
});
