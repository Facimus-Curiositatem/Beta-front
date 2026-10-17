import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { LaneFormComponent } from './lane-form.component';
import { LaneService } from '../../services/lane.service';
import { RolProcesoService } from '../../services/rol-proceso.service';

describe('LaneFormComponent', () => {
  let fixture: ComponentFixture<LaneFormComponent>;
  let component: LaneFormComponent;
  let laneService: jasmine.SpyObj<LaneService>;
  let rolProcesoService: jasmine.SpyObj<RolProcesoService>;

  beforeEach(async () => {
    laneService = jasmine.createSpyObj('LaneService', ['crear', 'editar', 'obtener']);
    rolProcesoService = jasmine.createSpyObj('RolProcesoService', ['listar']);
    rolProcesoService.listar.and.returnValue(of([
      { id: 1, nombre: 'Vendedor', descripcion: '', procesosQueLoUsan: 0, enUso: false }
    ]));

    await TestBed.configureTestingModule({
      imports: [LaneFormComponent],
      providers: [
        provideRouter([]),
        { provide: LaneService, useValue: laneService },
        { provide: RolProcesoService, useValue: rolProcesoService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LaneFormComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('poolId', '5');
    fixture.detectChanges();
  });

  it('debe crearse', () => {
    expect(component).toBeTruthy();
  });

  it('debe cargar los roles al inicializar', () => {
    expect(rolProcesoService.listar).toHaveBeenCalled();
  });

  it('debe tener el formulario con campos requeridos', () => {
    expect(component['form'].contains('nombre')).toBeTrue();
    expect(component['form'].contains('rolProcesoId')).toBeTrue();
  });
});
