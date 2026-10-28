import {
  ChangeDetectionStrategy, Component, ElementRef, computed, inject, input, signal, viewChild
} from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { CdkDrag, CdkDragEnd, CdkDragMove, DragConstrainPosition } from '@angular/cdk/drag-drop';
import { Observable } from 'rxjs';
import { ProcesoService } from '../../services/proceso.service';
import { ActividadService } from '../../services/actividad.service';
import { GatewayService } from '../../services/gateway.service';
import { EventoMensajeService } from '../../services/evento-mensaje.service';
import { ProcesoDiagramaResponse } from '../../models/proceso.model';
import { NodoDiagrama, PosicionNodo, Punto, TipoNodoDiagrama } from '../../models/diagrama.model';
import { TramoNavegacion } from '../../models/navegacion.model';
import { RutaNavegacionComponent } from '../ruta-navegacion/ruta-navegacion.component';
import { NodoDiagramaComponent } from '../nodo-diagrama/nodo-diagrama.component';
import { ajustar, aplicarPosicion, construirLayout, posicionAlSoltar, trazarConexiones } from './diagrama.layout';

@Component({
  selector: 'app-diagrama-proceso',
  standalone: true,
  imports: [RouterLink, CdkDrag, RutaNavegacionComponent, NodoDiagramaComponent],
  templateUrl: './diagrama-proceso.component.html',
  styleUrl: './diagrama-proceso.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DiagramaProcesoComponent {
  private readonly procesoService = inject(ProcesoService);
  private readonly actividadService = inject(ActividadService);
  private readonly gatewayService = inject(GatewayService);
  private readonly eventoMensajeService = inject(EventoMensajeService);
  private readonly router = inject(Router);

  id = input.required<string>();
  tramos = input<TramoNavegacion[]>([]);

  protected readonly status = signal<'loading' | 'success' | 'error'>('loading');
  protected readonly diagrama = signal<ProcesoDiagramaResponse | null>(null);
  protected readonly message = signal('');
  protected readonly guardando = signal(false);
  protected readonly aviso = signal('');
  private readonly arrastre = signal<{ id: number; delta: Punto } | null>(null);
  private readonly lienzo = viewChild<ElementRef<HTMLElement>>('lienzo');

  // El layout no depende del arrastre: así los nodos no se vuelven a pintar mientras se mueven.
  protected readonly layout = computed(() => {
    const diagrama = this.diagrama();
    return diagrama ? construirLayout(diagrama) : null;
  });

  protected readonly conexiones = computed(() => {
    const diagrama = this.diagrama();
    const layout = this.layout();
    return diagrama && layout ? trazarConexiones(diagrama, layout, this.arrastre()) : [];
  });

  protected readonly nombresTipo: Record<TipoNodoDiagrama, string> = {
    ACTIVIDAD: 'Actividad',
    GATEWAY: 'Gateway',
    EVENTO: 'Evento'
  };

  // Ajusta la esquina del nodo a la grilla del lienzo mientras se arrastra, como GridSnapping de bpmn-js.
  protected readonly ajustarAGrilla: DragConstrainPosition = (puntero, _ref, _dimensiones, recogida) => {
    const lienzo = this.lienzo()?.nativeElement.getBoundingClientRect();
    if (!lienzo) {
      return puntero;
    }
    return {
      x: lienzo.left + ajustar(puntero.x - recogida.x - lienzo.left) + recogida.x,
      y: lienzo.top + ajustar(puntero.y - recogida.y - lienzo.top) + recogida.y
    };
  };

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.status.set('loading');
    this.procesoService.obtenerDiagrama(Number(this.id())).subscribe({
      next: data => {
        this.diagrama.set(data);
        this.status.set('success');
      },
      error: (err: HttpErrorResponse) => {
        this.message.set(err.error?.detail ?? 'No fue posible cargar el diagrama');
        this.status.set('error');
      }
    });
  }

  mover(nodo: NodoDiagrama, event: CdkDragMove): void {
    this.arrastre.set({ id: nodo.id, delta: event.source.getFreeDragPosition() });
  }

  soltar(nodo: NodoDiagrama, event: CdkDragEnd): void {
    const delta = event.source.getFreeDragPosition();
    event.source.reset();
    this.arrastre.set(null);

    const diagrama = this.diagrama();
    const layout = this.layout();
    if (!diagrama || !layout) return;

    const destino = posicionAlSoltar(layout, nodo, delta);
    if (destino.laneId === nodo.laneId && destino.x === nodo.x && destino.y === nodo.y) return;

    // Se muestra la nueva posición de inmediato y se revierte si el backend la rechaza.
    this.diagrama.set(aplicarPosicion(diagrama, nodo, destino));
    this.guardando.set(true);
    this.message.set('');
    this.aviso.set('');

    this.guardarPosicion(diagrama, nodo, destino).subscribe({
      next: () => {
        this.guardando.set(false);
        this.aviso.set('Posición guardada');
      },
      error: (err: HttpErrorResponse) => {
        this.diagrama.set(diagrama);
        this.guardando.set(false);
        this.message.set(err.error?.detail ?? 'No fue posible guardar la posición');
      }
    });
  }

  editar(nodo: NodoDiagrama): void {
    const seccion = { ACTIVIDAD: 'actividades', GATEWAY: 'gateways', EVENTO: 'eventos-mensaje' }[nodo.tipo];
    this.router.navigate(['/lanes', nodo.laneId, seccion, nodo.id, 'editar'], {
      queryParams: { volverADiagrama: this.id() }
    });
  }

  private guardarPosicion(d: ProcesoDiagramaResponse, nodo: NodoDiagrama, destino: PosicionNodo): Observable<unknown> {
    const posicion = { posicionX: destino.x, posicionY: destino.y };
    switch (nodo.tipo) {
      case 'ACTIVIDAD': {
        const a = d.actividades.find(actividad => actividad.id === nodo.id)!;
        return this.actividadService.editar(a.id, {
          nombre: a.nombre,
          descripcion: a.descripcion ?? undefined,
          tipoActividad: a.tipoActividad,
          laneId: destino.laneId,
          ...posicion
        });
      }
      case 'GATEWAY': {
        const g = d.gateways.find(gateway => gateway.id === nodo.id)!;
        return this.gatewayService.editar(g.id, { nombre: g.nombre, tipoGateway: g.tipoGateway, ...posicion });
      }
      case 'EVENTO': {
        const e = d.eventos.find(evento => evento.id === nodo.id)!;
        return this.eventoMensajeService.editar(e.id, {
          nombre: e.nombre,
          tipoEvento: e.tipoEvento,
          contenido: e.contenido,
          claveCorrelacion: e.claveCorrelacion,
          origenExterno: e.origenExterno,
          ...posicion
        });
      }
    }
  }
}
