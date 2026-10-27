import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpErrorResponse } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { GatewayListComponent } from './gateway-list.component';
import { GatewayService } from '../../services/gateway.service';
import { GatewayResponse } from '../../models/gateway.model';

describe('GatewayListComponent', () => {
  let fixture: ComponentFixture<GatewayListComponent>;
  let component: GatewayListComponent;
  let gatewayService: jasmine.SpyObj<GatewayService>;

  const gateways: GatewayResponse[] = [
    { id: 1, nombre: 'Aprobado?', tipoGateway: 'EXCLUSIVO', posicionX: 10, posicionY: 20, laneId: 5 }
  ];

  beforeEach(async () => {
    gatewayService = jasmine.createSpyObj('GatewayService', ['listar', 'evaluarImpacto', 'eliminar']);
    gatewayService.listar.and.returnValue(of(gateways));
    gatewayService.evaluarImpacto.and.returnValue(of({
      requiereConfirmacion: true,
      rompeContinuidad: true,
      advertencias: ['El nodo Revisar quedara sin entrada.']
    }));
    gatewayService.eliminar.and.returnValue(of(undefined));

    await TestBed.configureTestingModule({
      imports: [GatewayListComponent],
      providers: [
        provideRouter([]),
        { provide: GatewayService, useValue: gatewayService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(GatewayListComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('laneId', '5');
    fixture.detectChanges();
  });

  it('debe crearse', () => {
    expect(component).toBeTruthy();
  });

  it('debe cargar los gateways del lane al inicializar', () => {
    expect(gatewayService.listar).toHaveBeenCalledWith(5);
  });

  it('debe mostrar los gateways en la tabla', () => {
    const rows = fixture.nativeElement.querySelectorAll('tbody tr');
    expect(rows.length).toBe(1);
    expect(rows[0].textContent).toContain('Aprobado?');
  });

  it('debe mostrar el mensaje de error si el back falla', () => {
    gatewayService.listar.and.returnValue(
      throwError(() => new HttpErrorResponse({ status: 500, error: { detail: 'Fallo del servidor' } }))
    );
    component.load();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.error').textContent).toContain('Fallo del servidor');
  });

  it('debe evaluar y mostrar el impacto antes de eliminar', () => {
    fixture.nativeElement.querySelector('button.eliminar').click();
    fixture.detectChanges();

    expect(gatewayService.evaluarImpacto).toHaveBeenCalledWith(1);
    expect(gatewayService.eliminar).not.toHaveBeenCalled();
    expect(fixture.nativeElement.textContent).toContain('El nodo Revisar quedara sin entrada.');
  });

  it('debe eliminar y recargar la lista al confirmar', () => {
    fixture.nativeElement.querySelector('button.eliminar').click();
    fixture.detectChanges();
    fixture.nativeElement.querySelector('button.confirmar').click();
    fixture.detectChanges();

    expect(gatewayService.eliminar).toHaveBeenCalledWith(1);
    expect(gatewayService.listar).toHaveBeenCalledTimes(2);
  });
});