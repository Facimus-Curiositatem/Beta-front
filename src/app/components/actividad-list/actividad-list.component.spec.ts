import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpErrorResponse } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { ActividadListComponent } from './actividad-list.component';
import { ActividadService } from '../../services/actividad.service';
import { ActividadResponse } from '../../models/actividad.model';

describe('ActividadListComponent', () => {
  let fixture: ComponentFixture<ActividadListComponent>;
  let component: ActividadListComponent;
  let actividadService: jasmine.SpyObj<ActividadService>;

  const actividades: ActividadResponse[] = [
    {
      id: 1, nombre: 'Revisar solicitud', descripcion: null,
      posicionX: 10, posicionY: 20, laneId: 5, tipoActividad: 'TAREA'
    }
  ];

  beforeEach(async () => {
    actividadService = jasmine.createSpyObj('ActividadService', ['listar', 'evaluarImpacto', 'eliminar']);
    actividadService.listar.and.returnValue(of(actividades));
    actividadService.evaluarImpacto.and.returnValue(of({
      requiereConfirmacion: true,
      rompeContinuidad: true,
      advertencias: ['El nodo Inicio quedara sin salida.']
    }));
    actividadService.eliminar.and.returnValue(of(undefined));

    await TestBed.configureTestingModule({
      imports: [ActividadListComponent],
      providers: [
        provideRouter([]),
        { provide: ActividadService, useValue: actividadService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ActividadListComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('laneId', '5');
    fixture.detectChanges();
  });

  it('debe crearse', () => {
    expect(component).toBeTruthy();
  });

  it('debe cargar las actividades del lane al inicializar', () => {
    expect(actividadService.listar).toHaveBeenCalledWith(5);
  });

  it('debe mostrar las actividades en la tabla', () => {
    const rows = fixture.nativeElement.querySelectorAll('tbody tr');
    expect(rows.length).toBe(1);
    expect(rows[0].textContent).toContain('Revisar solicitud');
  });

  it('debe mostrar el mensaje de error si el back falla', () => {
    actividadService.listar.and.returnValue(
      throwError(() => new HttpErrorResponse({ status: 500, error: { detail: 'Fallo del servidor' } }))
    );
    component.load();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.error').textContent).toContain('Fallo del servidor');
  });

  it('debe evaluar y mostrar el impacto antes de eliminar', () => {
    fixture.nativeElement.querySelector('button.eliminar').click();
    fixture.detectChanges();

    expect(actividadService.evaluarImpacto).toHaveBeenCalledWith(1);
    expect(actividadService.eliminar).not.toHaveBeenCalled();
    expect(fixture.nativeElement.textContent).toContain('El nodo Inicio quedara sin salida.');
  });

  it('debe eliminar y recargar la lista al confirmar', () => {
    fixture.nativeElement.querySelector('button.eliminar').click();
    fixture.detectChanges();
    fixture.nativeElement.querySelector('button.confirmar').click();
    fixture.detectChanges();

    expect(actividadService.eliminar).toHaveBeenCalledWith(1);
    expect(actividadService.listar).toHaveBeenCalledTimes(2);
  });
});