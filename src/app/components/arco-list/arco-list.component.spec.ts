import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { ArcoListComponent } from './arco-list.component';
import { ArcoService } from '../../services/arco.service';
import { NodoFlujoService } from '../../services/nodo-flujo.service';
import { ArcoResponse } from '../../models/arco.model';

describe('ArcoListComponent', () => {
  let fixture: ComponentFixture<ArcoListComponent>;
  let component: ArcoListComponent;
  let arcoService: jasmine.SpyObj<ArcoService>;
  let nodoFlujoService: jasmine.SpyObj<NodoFlujoService>;

  const arcos: ArcoResponse[] = [
    { id: 1, etiqueta: 'Si', condicion: 'monto > 100', origenId: 4, destinoId: 5, poolId: 2 }
  ];

  beforeEach(async () => {
    arcoService = jasmine.createSpyObj('ArcoService', ['listar', 'evaluarImpacto', 'eliminar']);
    arcoService.listar.and.returnValue(of(arcos));
    arcoService.eliminar.and.returnValue(of(void 0));
    nodoFlujoService = jasmine.createSpyObj('NodoFlujoService', ['listarPorPool']);
    nodoFlujoService.listarPorPool.and.returnValue(of([
      { id: 4, nombre: 'Revisar', tipo: 'ACTIVIDAD' },
      { id: 5, nombre: 'Aprobar', tipo: 'ACTIVIDAD' }
    ]));

    await TestBed.configureTestingModule({
      imports: [ArcoListComponent],
      providers: [
        provideRouter([]),
        { provide: ArcoService, useValue: arcoService },
        { provide: NodoFlujoService, useValue: nodoFlujoService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ArcoListComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('poolId', '2');
    fixture.detectChanges();
  });

  it('debe crearse', () => {
    expect(component).toBeTruthy();
  });

  it('debe cargar los arcos y nodos del pool al inicializar', () => {
    expect(arcoService.listar).toHaveBeenCalledWith(2);
    expect(nodoFlujoService.listarPorPool).toHaveBeenCalledWith(2);
  });

  it('debe mostrar los arcos con los nombres de los nodos', () => {
    const rows = fixture.nativeElement.querySelectorAll('tbody tr');
    expect(rows.length).toBe(1);
    expect(rows[0].textContent).toContain('Revisar');
    expect(rows[0].textContent).toContain('Aprobar');
  });

  it('debe mostrar una fila de aviso cuando no hay arcos', () => {
    arcoService.listar.and.returnValue(of([]));
    component.load();
    fixture.detectChanges();
    const rows = fixture.nativeElement.querySelectorAll('tbody tr');
    expect(rows.length).toBe(1);
    expect(rows[0].textContent).toContain('No hay arcos registrados.');
  });

  it('eliminar sin impacto borra el arco sin pedir confirmacion', () => {
    arcoService.evaluarImpacto.and.returnValue(of({ requiereConfirmacion: false, rompeContinuidad: false, advertencias: [] }));
    spyOn(window, 'confirm');
    component.eliminar(1);
    expect(window.confirm).not.toHaveBeenCalled();
    expect(arcoService.eliminar).toHaveBeenCalledWith(1);
  });

  it('eliminar con impacto no borra si el usuario cancela', () => {
    arcoService.evaluarImpacto.and.returnValue(of({
      requiereConfirmacion: true, rompeContinuidad: true, advertencias: ['El nodo quedara aislado']
    }));
    spyOn(window, 'confirm').and.returnValue(false);
    component.eliminar(1);
    expect(window.confirm).toHaveBeenCalled();
    expect(arcoService.eliminar).not.toHaveBeenCalled();
  });
});
