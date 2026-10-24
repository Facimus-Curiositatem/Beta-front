import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { InicioProcesosComponent } from './inicio-procesos.component';
describe('InicioProcesosComponent integración H3', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      imports: [InicioProcesosComponent],
      providers: [provideRouter([])]
    })
  );
  it('abre pools y compartir con el mismo ID real', () => {
    const f = TestBed.createComponent(InicioProcesosComponent);
    const nav = spyOn(TestBed.inject(Router), 'navigate').and.resolveTo(true);
    f.componentInstance.form.setValue({ procesoId: 10 });
    f.componentInstance.abrir();
    expect(nav).toHaveBeenCalledWith(['/procesos', 10, 'pools']);
    f.componentInstance.compartir();
    expect(nav).toHaveBeenCalledWith(['/procesos', 10, 'compartir']);
  });
  it('no navega con ID inválido', () => {
    const f = TestBed.createComponent(InicioProcesosComponent);
    const nav = spyOn(TestBed.inject(Router), 'navigate').and.resolveTo(true);
    f.componentInstance.form.setValue({ procesoId: 0 });
    f.componentInstance.abrir();
    f.componentInstance.compartir();
    expect(nav).not.toHaveBeenCalled();
    expect(f.componentInstance.form.invalid).toBeTrue();
  });
});
