import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ConfirmarEliminacionComponent } from './confirmar-eliminacion.component';
import { ImpactoEliminacionResponse } from '../../models/impacto-eliminacion.model';

describe('ConfirmarEliminacionComponent', () => {
  let fixture: ComponentFixture<ConfirmarEliminacionComponent>;
  let component: ConfirmarEliminacionComponent;

  function crear(impacto: ImpactoEliminacionResponse): void {
    fixture = TestBed.createComponent(ConfirmarEliminacionComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('nombre', 'Revisar solicitud');
    fixture.componentRef.setInput('impacto', impacto);
    fixture.detectChanges();
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConfirmarEliminacionComponent]
    }).compileComponents();
  });

  it('debe crearse', () => {
    crear({ requiereConfirmacion: false, rompeContinuidad: false, advertencias: [] });
    expect(component).toBeTruthy();
  });

  it('debe mostrar las advertencias de impacto', () => {
    crear({
      requiereConfirmacion: true,
      rompeContinuidad: true,
      advertencias: ['El nodo Inicio quedara sin salida.']
    });
    const texto = fixture.nativeElement.textContent;
    expect(texto).toContain('Revisar solicitud');
    expect(texto).toContain('El nodo Inicio quedara sin salida.');
  });

  it('debe indicar que no hay impacto cuando no hay advertencias', () => {
    crear({ requiereConfirmacion: false, rompeContinuidad: false, advertencias: [] });
    expect(fixture.nativeElement.textContent).toContain('no afecta otros elementos');
  });

  it('debe emitir confirmar y cancelar al pulsar los botones', () => {
    crear({ requiereConfirmacion: false, rompeContinuidad: false, advertencias: [] });
    let confirmado = false;
    let cancelado = false;
    component.confirmar.subscribe(() => confirmado = true);
    component.cancelar.subscribe(() => cancelado = true);

    fixture.nativeElement.querySelector('button.confirmar').click();
    fixture.nativeElement.querySelector('button.cancelar').click();

    expect(confirmado).toBeTrue();
    expect(cancelado).toBeTrue();
  });
});