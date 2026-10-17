import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { PoolFormComponent } from './pool-form.component';
import { PoolService } from '../../services/pool.service';

describe('PoolFormComponent', () => {
  let fixture: ComponentFixture<PoolFormComponent>;
  let component: PoolFormComponent;
  let poolService: jasmine.SpyObj<PoolService>;

  beforeEach(async () => {
    poolService = jasmine.createSpyObj('PoolService', ['crear', 'editar', 'obtener']);

    await TestBed.configureTestingModule({
      imports: [PoolFormComponent],
      providers: [
        provideRouter([]),
        { provide: PoolService, useValue: poolService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(PoolFormComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('procesoId', '10');
    fixture.detectChanges();
  });

  it('debe crearse', () => {
    expect(component).toBeTruthy();
  });

  it('debe tener el formulario con campos requeridos', () => {
    expect(component['form'].contains('nombre')).toBeTrue();
    expect(component['form'].contains('tipoParticipante')).toBeTrue();
    expect(component['form'].contains('cajaNegra')).toBeTrue();
  });

  it('debe marcar el formulario como invalido si nombre esta vacio', () => {
    component['form'].controls.nombre.setValue('');
    expect(component['form'].invalid).toBeTrue();
  });
});
