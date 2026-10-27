import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { ProcesosCompartidosListComponent } from './procesos-compartidos-list.component';
import { compartido } from '../../testing/compartidos.fixture';
describe('ProcesosCompartidosListComponent', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      imports: [ProcesosCompartidosListComponent],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()]
    })
  );
  afterEach(() => TestBed.inject(HttpTestingController).verify());
  it('enlaza al procesoId recibido', () => {
    const f = TestBed.createComponent(ProcesosCompartidosListComponent);
    f.detectChanges();
    TestBed.inject(HttpTestingController)
      .expectOne('/api/v1/procesos-compartidos')
      .flush([compartido]);
    f.detectChanges();
    expect(f.nativeElement.textContent).toContain('Compra');
    expect(f.nativeElement.querySelector('a').getAttribute('href')).toBe(
      '/procesos-compartidos/10'
    );
  });
  it('muestra errores y termina carga', () => {
    const f = TestBed.createComponent(ProcesosCompartidosListComponent);
    f.detectChanges();
    TestBed.inject(HttpTestingController)
      .expectOne('/api/v1/procesos-compartidos')
      .flush({ detail: 'Sin acceso' }, { status: 403, statusText: 'Forbidden' });
    f.detectChanges();
    expect(f.nativeElement.textContent).toContain('Sin acceso');
    expect(f.componentInstance.loading()).toBeFalse();
  });
});
