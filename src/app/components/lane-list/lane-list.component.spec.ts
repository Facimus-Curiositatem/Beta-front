import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { LaneListComponent } from './lane-list.component';
import { LaneService } from '../../services/lane.service';
import { LaneResponse } from '../../models/lane.model';

describe('LaneListComponent', () => {
  let fixture: ComponentFixture<LaneListComponent>;
  let component: LaneListComponent;
  let laneService: jasmine.SpyObj<LaneService>;

  const lanes: LaneResponse[] = [
    { id: 1, nombre: 'Ventas', orden: 0, poolId: 5, rolProcesoId: 2, rolProcesoNombre: 'Vendedor' }
  ];

  beforeEach(async () => {
    laneService = jasmine.createSpyObj('LaneService', ['listar', 'eliminar', 'reordenar']);
    laneService.listar.and.returnValue(of(lanes));

    await TestBed.configureTestingModule({
      imports: [LaneListComponent],
      providers: [
        provideRouter([]),
        { provide: LaneService, useValue: laneService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LaneListComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('id', '5');
    fixture.detectChanges();
  });

  it('debe crearse', () => {
    expect(component).toBeTruthy();
  });

  it('debe cargar los lanes al inicializar', () => {
    expect(laneService.listar).toHaveBeenCalledWith(5);
  });

  it('debe mostrar los lanes en la tabla', () => {
    const rows = fixture.nativeElement.querySelectorAll('tbody tr');
    expect(rows.length).toBe(1);
    expect(rows[0].textContent).toContain('Ventas');
  });
});
