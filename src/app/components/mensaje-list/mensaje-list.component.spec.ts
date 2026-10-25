import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { MensajeListComponent } from './mensaje-list.component';
import { MensajeService } from '../../services/mensaje.service';
import { PoolService } from '../../services/pool.service';
import { MensajeResponse } from '../../models/mensaje.model';

describe('MensajeListComponent', () => {
  let fixture: ComponentFixture<MensajeListComponent>;
  let component: MensajeListComponent;
  let mensajeService: jasmine.SpyObj<MensajeService>;
  let poolService: jasmine.SpyObj<PoolService>;

  const mensajes: MensajeResponse[] = [
    { id: 1, nombre: 'Pedido', contenido: 'Datos del pedido', poolOrigenId: 2, poolDestinoId: 3, procesoId: 7,
      eventoThrowId: 10, eventoCatchId: 11, claveCorrelacion: 'pedidoId', tipoDestinoExterno: null,
      destinoExterno: null, politicaFalloNotificacion: null, actividadErrorId: null, politicaSinCaso: null, sinReceptor: false }
  ];

  beforeEach(async () => {
    mensajeService = jasmine.createSpyObj('MensajeService', ['listar', 'eliminar']);
    mensajeService.listar.and.returnValue(of(mensajes));
    poolService = jasmine.createSpyObj('PoolService', ['listar']);
    poolService.listar.and.returnValue(of([
      { id: 2, nombre: 'Cliente', tipoParticipante: 'CLIENTE', cajaNegra: false, orden: 0, procesoId: 7 },
      { id: 3, nombre: 'Tienda', tipoParticipante: 'EMPRESA', cajaNegra: false, orden: 1, procesoId: 7 }
    ]));

    await TestBed.configureTestingModule({
      imports: [MensajeListComponent],
      providers: [
        provideRouter([]),
        { provide: MensajeService, useValue: mensajeService },
        { provide: PoolService, useValue: poolService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(MensajeListComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('procesoId', '7');
    fixture.detectChanges();
  });

  it('debe crearse', () => {
    expect(component).toBeTruthy();
  });

  it('debe cargar los mensajes y pools del proceso al inicializar', () => {
    expect(mensajeService.listar).toHaveBeenCalledWith(7);
    expect(poolService.listar).toHaveBeenCalledWith(7);
  });

  it('debe mostrar los mensajes con el nombre de los pools', () => {
    const rows = fixture.nativeElement.querySelectorAll('tbody tr');
    expect(rows.length).toBe(1);
    expect(rows[0].textContent).toContain('Pedido');
    expect(rows[0].textContent).toContain('Cliente');
    expect(rows[0].textContent).toContain('Tienda');
  });

  it('debe mostrar una fila de aviso cuando no hay mensajes', () => {
    mensajeService.listar.and.returnValue(of([]));
    component.load();
    fixture.detectChanges();
    const rows = fixture.nativeElement.querySelectorAll('tbody tr');
    expect(rows.length).toBe(1);
    expect(rows[0].textContent).toContain('No hay mensajes registrados.');
  });
});
