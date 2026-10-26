import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { GatewayFormComponent } from './gateway-form.component';
import { GatewayService } from '../../services/gateway.service';
import { GatewayResponse } from '../../models/gateway.model';

describe('GatewayFormComponent', () => {
  let fixture: ComponentFixture<GatewayFormComponent>;
  let component: GatewayFormComponent;
  let gatewayService: jasmine.SpyObj<GatewayService>;

  const gateway: GatewayResponse = {
    id: 1, nombre: 'Aprobado?', tipoGateway: 'EXCLUSIVO', posicionX: 10, posicionY: 20, laneId: 5
  };

  beforeEach(async () => {
    gatewayService = jasmine.createSpyObj('GatewayService', ['crear', 'editar', 'obtener']);
    gatewayService.crear.and.returnValue(of(gateway));

    await TestBed.configureTestingModule({
      imports: [GatewayFormComponent],
      providers: [
        provideRouter([]),
        { provide: GatewayService, useValue: gatewayService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(GatewayFormComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('laneId', '5');
    fixture.detectChanges();
  });

  it('debe crearse', () => {
    expect(component).toBeTruthy();
  });

  it('debe tener el formulario con los campos esperados', () => {
    expect(component['form'].contains('nombre')).toBeTrue();
    expect(component['form'].contains('tipoGateway')).toBeTrue();
    expect(component['form'].contains('posicionX')).toBeTrue();
    expect(component['form'].contains('posicionY')).toBeTrue();
  });

  it('debe marcar el formulario como invalido si nombre esta vacio', () => {
    component['form'].controls.nombre.setValue('');
    expect(component['form'].invalid).toBeTrue();
  });

  it('debe crear el gateway en el lane y volver a la lista', () => {
    const navigate = spyOn(TestBed.inject(Router), 'navigate');
    component['form'].patchValue({ nombre: 'Aprobado?', tipoGateway: 'PARALELO' });

    component.submit();

    expect(gatewayService.crear).toHaveBeenCalledWith(5, jasmine.objectContaining({
      nombre: 'Aprobado?',
      tipoGateway: 'PARALELO'
    }));
    expect(navigate).toHaveBeenCalledWith(['/lanes', '5', 'gateways']);
  });

  it('no debe llamar al servicio si el formulario es invalido', () => {
    component.submit();
    expect(gatewayService.crear).not.toHaveBeenCalled();
  });
});