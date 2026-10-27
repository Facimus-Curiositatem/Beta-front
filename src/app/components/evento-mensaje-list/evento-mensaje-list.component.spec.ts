import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { EventoMensajeListComponent } from './evento-mensaje-list.component';
import { EventoMensajeService } from '../../services/evento-mensaje.service';
import { EventoMensajeResponse } from '../../models/evento-mensaje.model';

describe('EventoMensajeListComponent', () => {
  let fixture: ComponentFixture<EventoMensajeListComponent>;
  let component: EventoMensajeListComponent;
  let eventoMensajeService: jasmine.SpyObj<EventoMensajeService>;

  const eventos: EventoMensajeResponse[] = [
    { id: 1, nombre: 'Enviar pedido', tipoEvento: 'THROW', contenido: 'Pedido', claveCorrelacion: 'pedidoId',
      posicionX: 10, posicionY: 20, laneId: 3, origenExterno: false }
  ];

  beforeEach(async () => {
    eventoMensajeService = jasmine.createSpyObj('EventoMensajeService', ['listar', 'eliminar']);
    eventoMensajeService.listar.and.returnValue(of(eventos));
    eventoMensajeService.eliminar.and.returnValue(of(void 0));

    await TestBed.configureTestingModule({
      imports: [EventoMensajeListComponent],
      providers: [
        provideRouter([]),
        { provide: EventoMensajeService, useValue: eventoMensajeService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(EventoMensajeListComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('laneId', '3');
    fixture.detectChanges();
  });

  it('debe crearse', () => {
    expect(component).toBeTruthy();
  });

  it('debe cargar los eventos del lane al inicializar', () => {
    expect(eventoMensajeService.listar).toHaveBeenCalledWith(3);
  });

  it('debe mostrar los eventos en la tabla', () => {
    const rows = fixture.nativeElement.querySelectorAll('tbody tr');
    expect(rows.length).toBe(1);
    expect(rows[0].textContent).toContain('Enviar pedido');
    expect(rows[0].textContent).toContain('THROW');
  });

  it('debe mostrar una fila de aviso cuando no hay eventos', () => {
    eventoMensajeService.listar.and.returnValue(of([]));
    component.load();
    fixture.detectChanges();
    const rows = fixture.nativeElement.querySelectorAll('tbody tr');
    expect(rows.length).toBe(1);
    expect(rows[0].textContent).toContain('No hay eventos de mensaje registrados.');
  });

  it('eliminar llama al servicio y recarga la lista', () => {
    component.eliminar(1);
    expect(eventoMensajeService.eliminar).toHaveBeenCalledWith(1);
    expect(eventoMensajeService.listar).toHaveBeenCalledTimes(2);
  });
});
