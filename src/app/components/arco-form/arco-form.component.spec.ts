import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { ArcoFormComponent } from './arco-form.component';
import { ArcoService } from '../../services/arco.service';
import { NodoFlujoService } from '../../services/nodo-flujo.service';

describe('ArcoFormComponent', () => {
  let fixture: ComponentFixture<ArcoFormComponent>;
  let component: ArcoFormComponent;
  let arcoService: jasmine.SpyObj<ArcoService>;
  let nodoFlujoService: jasmine.SpyObj<NodoFlujoService>;

  beforeEach(async () => {
    arcoService = jasmine.createSpyObj('ArcoService', ['crear', 'editar', 'obtener']);
    arcoService.crear.and.returnValue(of({ id: 1, etiqueta: '', condicion: '', origenId: 4, destinoId: 5, poolId: 2 }));
    nodoFlujoService = jasmine.createSpyObj('NodoFlujoService', ['listarPorPool']);
    nodoFlujoService.listarPorPool.and.returnValue(of([
      { id: 4, nombre: 'Revisar', tipo: 'ACTIVIDAD' },
      { id: 5, nombre: 'Aprobado?', tipo: 'GATEWAY' }
    ]));

    await TestBed.configureTestingModule({
      imports: [ArcoFormComponent],
      providers: [
        provideRouter([]),
        { provide: ArcoService, useValue: arcoService },
        { provide: NodoFlujoService, useValue: nodoFlujoService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ArcoFormComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('poolId', '2');
    fixture.detectChanges();
  });

  it('debe crearse', () => {
    expect(component).toBeTruthy();
  });

  it('debe cargar los nodos del pool en los selects', () => {
    expect(nodoFlujoService.listarPorPool).toHaveBeenCalledWith(2);
    const opcionesOrigen = fixture.nativeElement.querySelectorAll('select')[0].querySelectorAll('option');
    expect(opcionesOrigen.length).toBe(3);
    expect(opcionesOrigen[2].textContent).toContain('Aprobado?');
  });

  it('submit crea el arco sin enviar campos vacios', () => {
    component['form'].patchValue({ origenId: 4, destinoId: 5 });
    component.submit();
    expect(arcoService.crear).toHaveBeenCalledWith({
      origenId: 4, destinoId: 5, etiqueta: undefined, condicion: undefined
    });
  });
});
