import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { EventoMensajeFormComponent } from './evento-mensaje-form.component';
import { EventoMensajeService } from '../../services/evento-mensaje.service';
import { EventoMensajeResponse } from '../../models/evento-mensaje.model';

describe('EventoMensajeFormComponent', () => {
  let fixture: ComponentFixture<EventoMensajeFormComponent>;
  let component: EventoMensajeFormComponent;
  let eventoMensajeService: jasmine.SpyObj<EventoMensajeService>;

  const evento: EventoMensajeResponse = {
    id: 1, nombre: 'Enviar pedido', tipoEvento: 'THROW', contenido: 'Pedido', claveCorrelacion: 'pedidoId',
    posicionX: 10, posicionY: 20, laneId: 3, origenExterno: false
  };

  beforeEach(async () => {
    eventoMensajeService = jasmine.createSpyObj('EventoMensajeService', ['crear', 'editar', 'obtener']);
    eventoMensajeService.crear.and.returnValue(of(evento));

    await TestBed.configureTestingModule({
      imports: [EventoMensajeFormComponent],
      providers: [
        provideRouter([]),
        { provide: EventoMensajeService, useValue: eventoMensajeService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(EventoMensajeFormComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('laneId', '3');
    fixture.detectChanges();
  });

  it('debe crearse', () => {
    expect(component).toBeTruthy();
  });

  it('debe mostrar las opciones de tipo de evento', () => {
    const opciones = fixture.nativeElement.querySelectorAll('select option');
    expect(opciones.length).toBe(3);
    expect(opciones[1].textContent).toContain('CATCH_INICIO');
  });

  it('submit crea el evento en el lane', () => {
    component['form'].patchValue({ nombre: 'Enviar pedido', contenido: 'Pedido', claveCorrelacion: 'pedidoId' });
    component.submit();
    expect(eventoMensajeService.crear).toHaveBeenCalledWith(3, jasmine.objectContaining({
      nombre: 'Enviar pedido', tipoEvento: 'THROW', origenExterno: false
    }));
  });

  it('no envia el formulario si faltan campos obligatorios', () => {
    component.submit();
    expect(eventoMensajeService.crear).not.toHaveBeenCalled();
  });
});
