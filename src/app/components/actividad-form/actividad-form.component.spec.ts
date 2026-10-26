import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { ActividadFormComponent } from './actividad-form.component';
import { ActividadService } from '../../services/actividad.service';
import { ActividadResponse } from '../../models/actividad.model';

describe('ActividadFormComponent', () => {
  let fixture: ComponentFixture<ActividadFormComponent>;
  let component: ActividadFormComponent;
  let actividadService: jasmine.SpyObj<ActividadService>;

  const actividad: ActividadResponse = {
    id: 1, nombre: 'Revisar solicitud', descripcion: null,
    posicionX: 10, posicionY: 20, laneId: 5, tipoActividad: 'TAREA'
  };

  beforeEach(async () => {
    actividadService = jasmine.createSpyObj('ActividadService', ['crear', 'editar', 'obtener']);
    actividadService.crear.and.returnValue(of(actividad));

    await TestBed.configureTestingModule({
      imports: [ActividadFormComponent],
      providers: [
        provideRouter([]),
        { provide: ActividadService, useValue: actividadService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ActividadFormComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('laneId', '5');
    fixture.detectChanges();
  });

  it('debe crearse', () => {
    expect(component).toBeTruthy();
  });

  it('debe tener el formulario con los campos esperados', () => {
    expect(component['form'].contains('nombre')).toBeTrue();
    expect(component['form'].contains('descripcion')).toBeTrue();
    expect(component['form'].contains('tipoActividad')).toBeTrue();
    expect(component['form'].contains('posicionX')).toBeTrue();
    expect(component['form'].contains('posicionY')).toBeTrue();
  });

  it('debe marcar el formulario como invalido si nombre esta vacio', () => {
    component['form'].controls.nombre.setValue('');
    expect(component['form'].invalid).toBeTrue();
  });

  it('debe crear la actividad en el lane y volver a la lista', () => {
    const navigate = spyOn(TestBed.inject(Router), 'navigate');
    component['form'].patchValue({ nombre: 'Revisar solicitud' });

    component.submit();

    expect(actividadService.crear).toHaveBeenCalledWith(5, jasmine.objectContaining({
      nombre: 'Revisar solicitud',
      tipoActividad: 'TAREA'
    }));
    expect(navigate).toHaveBeenCalledWith(['/lanes', '5', 'actividades']);
  });

  it('no debe llamar al servicio si el formulario es invalido', () => {
    component.submit();
    expect(actividadService.crear).not.toHaveBeenCalled();
  });
});