import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { MensajeFormComponent } from './mensaje-form.component';
import { MensajeService } from '../../services/mensaje.service';
import { CorrelacionService } from '../../services/correlacion.service';
import { PoolService } from '../../services/pool.service';
import { LaneService } from '../../services/lane.service';
import { EventoMensajeService } from '../../services/evento-mensaje.service';
import { MensajeResponse } from '../../models/mensaje.model';

describe('MensajeFormComponent', () => {
  let fixture: ComponentFixture<MensajeFormComponent>;
  let component: MensajeFormComponent;
  let mensajeService: jasmine.SpyObj<MensajeService>;
  let correlacionService: jasmine.SpyObj<CorrelacionService>;
  let poolService: jasmine.SpyObj<PoolService>;
  let laneService: jasmine.SpyObj<LaneService>;
  let eventoMensajeService: jasmine.SpyObj<EventoMensajeService>;

  const mensaje: MensajeResponse = {
    id: 1, nombre: 'Pedido', contenido: 'Datos', poolOrigenId: 2, poolDestinoId: 3, procesoId: 7,
    eventoThrowId: 10, eventoCatchId: 11, claveCorrelacion: 'pedidoId', tipoDestinoExterno: null,
    destinoExterno: null, politicaFalloNotificacion: null, actividadErrorId: null, politicaSinCaso: null, sinReceptor: false
  };

  function crear(mensajeId?: string): void {
    fixture = TestBed.createComponent(MensajeFormComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('procesoId', '7');
    if (mensajeId) fixture.componentRef.setInput('mensajeId', mensajeId);
    fixture.detectChanges();
  }

  beforeEach(async () => {
    mensajeService = jasmine.createSpyObj('MensajeService', ['crear', 'editar', 'obtener']);
    mensajeService.crear.and.returnValue(of(mensaje));
    mensajeService.obtener.and.returnValue(of(mensaje));
    correlacionService = jasmine.createSpyObj('CorrelacionService', ['obtener', 'definir', 'eliminar']);
    correlacionService.obtener.and.returnValue(throwError(() => ({ status: 404 })));
    correlacionService.definir.and.returnValue(of({ id: 1, criterio: 'pedidoId', mensajeId: 1 }));
    poolService = jasmine.createSpyObj('PoolService', ['listar']);
    poolService.listar.and.returnValue(of([
      { id: 2, nombre: 'Cliente', tipoParticipante: 'CLIENTE', cajaNegra: false, orden: 0, procesoId: 7 },
      { id: 3, nombre: 'Tienda', tipoParticipante: 'EMPRESA', cajaNegra: false, orden: 1, procesoId: 7 }
    ]));
    laneService = jasmine.createSpyObj('LaneService', ['listar']);
    laneService.listar.and.returnValue(of([
      { id: 8, nombre: 'Ventas', orden: 0, poolId: 2, rolProcesoId: 1, rolProcesoNombre: 'Vendedor' }
    ]));
    eventoMensajeService = jasmine.createSpyObj('EventoMensajeService', ['listar']);
    eventoMensajeService.listar.and.returnValue(of([
      { id: 10, nombre: 'Enviar', tipoEvento: 'THROW', contenido: '', claveCorrelacion: 'k',
        posicionX: 0, posicionY: 0, laneId: 8, origenExterno: false },
      { id: 11, nombre: 'Recibir', tipoEvento: 'CATCH_INICIO', contenido: '', claveCorrelacion: 'k',
        posicionX: 0, posicionY: 0, laneId: 8, origenExterno: false }
    ]));

    await TestBed.configureTestingModule({
      imports: [MensajeFormComponent],
      providers: [
        provideRouter([]),
        { provide: MensajeService, useValue: mensajeService },
        { provide: CorrelacionService, useValue: correlacionService },
        { provide: PoolService, useValue: poolService },
        { provide: LaneService, useValue: laneService },
        { provide: EventoMensajeService, useValue: eventoMensajeService }
      ]
    }).compileComponents();
  });

  it('debe crearse y cargar los pools del proceso', () => {
    crear();
    expect(component).toBeTruthy();
    expect(poolService.listar).toHaveBeenCalledWith(7);
  });

  it('al elegir pool origen carga solo eventos THROW', () => {
    crear();
    component['form'].controls.poolOrigenId.setValue(2);
    expect(laneService.listar).toHaveBeenCalledWith(2);
    expect(component['eventosThrow']().map(e => e.id)).toEqual([10]);
  });

  it('al elegir pool destino carga solo eventos CATCH', () => {
    crear();
    component['form'].controls.poolDestinoId.setValue(3);
    expect(component['eventosCatch']().map(e => e.id)).toEqual([11]);
  });

  it('submit crea el mensaje sin enviar opcionales vacios', () => {
    crear();
    component['form'].patchValue({
      nombre: 'Pedido', contenido: 'Datos', poolOrigenId: 2, poolDestinoId: 3, eventoThrowId: 10
    });
    component.submit();
    const [procesoId, body] = mensajeService.crear.calls.mostRecent().args;
    expect(procesoId).toBe(7);
    expect(body).toEqual(jasmine.objectContaining({ poolOrigenId: 2, poolDestinoId: 3, eventoThrowId: 10 }));
    expect(body.tipoDestinoExterno).toBeUndefined();
    expect(body.politicaSinCaso).toBeUndefined();
  });

  it('en edicion carga el mensaje, bloquea los pools y muestra la correlacion', () => {
    crear('1');
    expect(mensajeService.obtener).toHaveBeenCalledWith(1);
    expect(correlacionService.obtener).toHaveBeenCalledWith(1);
    expect(component['form'].controls.poolOrigenId.disabled).toBeTrue();
    expect(fixture.nativeElement.textContent).toContain('Correlacion');
  });

  it('definirCorrelacion envia el criterio', () => {
    crear('1');
    component['correlacionForm'].setValue({ criterio: 'pedidoId' });
    component.definirCorrelacion();
    expect(correlacionService.definir).toHaveBeenCalledWith(1, { criterio: 'pedidoId' });
  });
});
