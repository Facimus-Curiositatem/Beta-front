import {
  ChangeDetectionStrategy, Component, ElementRef, Injector, afterNextRender, computed, effect, inject, input,
  signal, viewChild
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { CdkDrag, CdkDragEnd, CdkDragMove, DragConstrainPosition } from '@angular/cdk/drag-drop';
import { Observable, of, tap } from 'rxjs';
import { ProcesoService } from '../../services/proceso.service';
import { ActividadService } from '../../services/actividad.service';
import { GatewayService } from '../../services/gateway.service';
import { EventoMensajeService } from '../../services/evento-mensaje.service';
import { TokenService } from '../../services/token.service';
import { ProcesoDiagramaResponse } from '../../models/proceso.model';
import { TipoActividad } from '../../models/actividad.model';
import { TipoGateway } from '../../models/gateway.model';
import { ImpactoEliminacionResponse } from '../../models/impacto-eliminacion.model';
import {
  BorradorNodo, CambiosActividad, CambiosGateway, ElementoPaleta, LaneDiagrama, NodoDiagrama, OpcionLane, Punto,
  Seleccion, TipoElementoPaleta, TipoNodoDiagrama
} from '../../models/diagrama.model';
import { TramoNavegacion } from '../../models/navegacion.model';
import { RutaNavegacionComponent } from '../ruta-navegacion/ruta-navegacion.component';
import { NodoDiagramaComponent } from '../nodo-diagrama/nodo-diagrama.component';
import { PaletaModeladoComponent } from '../paleta-modelado/paleta-modelado.component';
import { PropiedadesActividadComponent } from '../propiedades-actividad/propiedades-actividad.component';
import { PropiedadesGatewayComponent } from '../propiedades-gateway/propiedades-gateway.component';
import { ConfirmarEliminacionComponent } from '../confirmar-eliminacion/confirmar-eliminacion.component';
import {
  GRILLA, ajustar, aplicarPosicion, construirLayout, posicionAlSoltar, posicionEnLane, siguienteEspacioLibre,
  tamanoDe, trazarConexiones
} from './diagrama.layout';

interface EliminacionPendiente {
  nombre: string;
  impacto: ImpactoEliminacionResponse;
  ejecutar: () => Observable<void>;
}

const SIN_IMPACTO: ImpactoEliminacionResponse = { requiereConfirmacion: true, rompeContinuidad: false, advertencias: [] };

const PASOS_TECLADO: Record<string, Punto> = {
  ArrowLeft: { x: -1, y: 0 },
  ArrowRight: { x: 1, y: 0 },
  ArrowUp: { x: 0, y: -1 },
  ArrowDown: { x: 0, y: 1 }
};

function esTipoNodo(tipo: TipoElementoPaleta): tipo is TipoNodoDiagrama {
  return tipo === 'ACTIVIDAD' || tipo === 'GATEWAY' || tipo === 'EVENTO';
}

@Component({
  selector: 'app-diagrama-proceso',
  standalone: true,
  imports: [
    RouterLink, ReactiveFormsModule, CdkDrag, RutaNavegacionComponent, NodoDiagramaComponent, PaletaModeladoComponent,
    PropiedadesActividadComponent, PropiedadesGatewayComponent, ConfirmarEliminacionComponent
  ],
  templateUrl: './diagrama-proceso.component.html',
  styleUrl: './diagrama-proceso.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DiagramaProcesoComponent {
  private readonly procesoService = inject(ProcesoService);
  private readonly actividadService = inject(ActividadService);
  private readonly gatewayService = inject(GatewayService);
  private readonly eventoMensajeService = inject(EventoMensajeService);
  private readonly tokens = inject(TokenService);
  private readonly injector = inject(Injector);

  id = input.required<string>();
  tramos = input<TramoNavegacion[]>([]);

  protected readonly status = signal<'loading' | 'success' | 'error'>('loading');
  protected readonly diagrama = signal<ProcesoDiagramaResponse | null>(null);
  protected readonly message = signal('');
  protected readonly guardando = signal(false);
  protected readonly aviso = signal('');
  protected readonly seleccion = signal<Seleccion | null>(null);
  protected readonly pendiente = signal<ElementoPaleta | null>(null);
  protected readonly laneDestino = signal<number | null>(null);
  protected readonly borrador = signal<BorradorNodo | null>(null);
  protected readonly creando = signal(false);
  protected readonly eliminacion = signal<EliminacionPendiente | null>(null);
  protected readonly nombreBorrador = new FormControl('', { nonNullable: true, validators: Validators.required });
  private readonly arrastrePaleta = signal<ElementoPaleta | null>(null);
  private readonly arrastre = signal<{ id: number; delta: Punto } | null>(null);
  private readonly lienzo = viewChild<ElementRef<HTMLElement>>('lienzo');
  private readonly inputBorrador = viewChild<ElementRef<HTMLInputElement>>('inputBorrador');

  // El backend solo deja modificar a administrador y editor, y solo el administrador elimina.
  protected readonly puedeEditar = computed(() => ['ADMINISTRADOR', 'EDITOR'].includes(this.tokens.rol() ?? ''));
  protected readonly puedeEliminar = computed(() => this.tokens.rol() === 'ADMINISTRADOR');

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

  protected readonly nodoBorrador = computed<NodoDiagrama | null>(() => {
    const borrador = this.borrador();
    return borrador ? { id: -1, nombre: '', ...borrador, ...tamanoDe(borrador.tipo) } : null;
  });

  protected readonly actividadSeleccionada = computed(() => {
    const seleccion = this.seleccion();
    return seleccion?.tipo === 'NODO' ? this.diagrama()?.actividades.find(a => a.id === seleccion.id) ?? null : null;
  });

  protected readonly gatewaySeleccionado = computed(() => {
    const seleccion = this.seleccion();
    return seleccion?.tipo === 'NODO' ? this.diagrama()?.gateways.find(g => g.id === seleccion.id) ?? null : null;
  });

  protected readonly lanesDelPool = computed<OpcionLane[]>(() => {
    const diagrama = this.diagrama();
    const laneId = this.actividadSeleccionada()?.laneId ?? this.gatewaySeleccionado()?.laneId;
    const poolId = diagrama?.lanes.find(l => l.id === laneId)?.poolId;
    return (diagrama?.lanes ?? [])
      .filter(l => l.poolId === poolId)
      .sort((a, b) => a.orden - b.orden)
      .map(l => ({ id: l.id, nombre: l.nombre }));
  });

  protected readonly nombreLaneGateway = computed(() =>
    this.lanesDelPool().find(l => l.id === this.gatewaySeleccionado()?.laneId)?.nombre ?? '');

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

  constructor() {
    effect(() => this.inputBorrador()?.nativeElement.focus());
  }

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

  // Recarga sin pasar por "cargando", para reflejar lo que el backend cambió en cascada.
  private refrescar(): void {
    this.procesoService.obtenerDiagrama(Number(this.id())).subscribe({
      next: data => this.diagrama.set(data),
      error: (err: HttpErrorResponse) => this.message.set(err.error?.detail ?? 'No fue posible actualizar el diagrama')
    });
  }

  // ---- Paleta ----

  elegirDePaleta(elemento: ElementoPaleta): void {
    this.cancelarBorrador();
    if (this.pendiente() === elemento) {
      this.pendiente.set(null);
      this.aviso.set('');
      return;
    }
    this.pendiente.set(elemento);
    this.aviso.set(`Haz clic en un lane para colocar «${elemento.etiqueta}», o usa «Colocar aquí». Esc cancela.`);
  }

  iniciarArrastrePaleta(elemento: ElementoPaleta): void {
    this.cancelarBorrador();
    this.pendiente.set(null);
    this.arrastrePaleta.set(elemento);
  }

  terminarArrastrePaleta(): void {
    this.arrastrePaleta.set(null);
    this.laneDestino.set(null);
  }

  sobreLane(event: DragEvent, lane: LaneDiagrama): void {
    const elemento = this.arrastrePaleta();
    if (!elemento || !esTipoNodo(elemento.tipo)) return;
    event.preventDefault();
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = 'copy';
    }
    this.laneDestino.set(lane.id);
  }

  soltarEnLane(event: DragEvent, lane: LaneDiagrama): void {
    const elemento = this.arrastrePaleta();
    this.terminarArrastrePaleta();
    if (!elemento) return;
    event.preventDefault();
    this.colocarEnPunto(event, lane, elemento);
  }

  clicEnLane(event: MouseEvent, lane: LaneDiagrama): void {
    const elemento = this.pendiente();
    if (!elemento) {
      this.seleccion.set(null);
      this.eliminacion.set(null);
      return;
    }
    this.colocarEnPunto(event, lane, elemento);
  }

  colocarAqui(lane: LaneDiagrama, event: Event): void {
    event.stopPropagation();
    const elemento = this.pendiente();
    if (!elemento) return;
    const tipo = elemento.tipo;
    const subtipo = elemento.subtipo;
    if (!esTipoNodo(tipo) || !subtipo) return;
    this.iniciarBorrador(tipo, subtipo, lane, siguienteEspacioLibre(lane, tipo));
  }

  private colocarEnPunto(event: MouseEvent, lane: LaneDiagrama, elemento: ElementoPaleta): void {
    const tipo = elemento.tipo;
    const subtipo = elemento.subtipo;
    if (!esTipoNodo(tipo) || !subtipo) return;
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    this.iniciarBorrador(tipo, subtipo, lane, posicionEnLane(lane, tipo, event.clientX - rect.left, event.clientY - rect.top));
  }

  // ---- Borrador: la figura recién soltada espera su nombre antes de crearse ----

  private iniciarBorrador(tipo: TipoNodoDiagrama, subtipo: NodoDiagrama['subtipo'], lane: LaneDiagrama, posicion: Punto): void {
    this.pendiente.set(null);
    this.seleccion.set(null);
    this.eliminacion.set(null);
    this.message.set('');
    this.aviso.set('Escribe el nombre y pulsa Enter para crear. Esc cancela.');
    this.nombreBorrador.reset('');
    this.borrador.set({ tipo, subtipo, laneId: lane.id, x: posicion.x, y: posicion.y });
  }

  cancelarBorrador(): void {
    if (this.creando()) return;
    if (this.borrador()) {
      this.aviso.set('');
    }
    this.borrador.set(null);
  }

  alSalirDelBorrador(): void {
    if (this.creando()) return;
    if (this.nombreBorrador.getRawValue().trim()) {
      this.confirmarBorrador();
    } else {
      this.cancelarBorrador();
    }
  }

  confirmarBorrador(): void {
    const borrador = this.borrador();
    if (!borrador || this.creando()) return;
    const nombre = this.nombreBorrador.getRawValue().trim();
    if (!nombre) {
      this.cancelarBorrador();
      return;
    }

    this.creando.set(true);
    this.message.set('');
    const posicion = { posicionX: borrador.x, posicionY: borrador.y };
    const creacion$: Observable<{ id: number }> = borrador.tipo === 'GATEWAY'
      ? this.gatewayService
          .crear(borrador.laneId, { nombre, tipoGateway: borrador.subtipo as TipoGateway, ...posicion })
          .pipe(tap(gateway => this.diagrama.update(d => d && { ...d, gateways: [...d.gateways, gateway] })))
      : this.actividadService
          .crear(borrador.laneId, { nombre, tipoActividad: borrador.subtipo as TipoActividad, ...posicion })
          .pipe(tap(actividad => this.diagrama.update(d => d && { ...d, actividades: [...d.actividades, actividad] })));

    creacion$.subscribe({
      next: creado => {
        this.creando.set(false);
        this.borrador.set(null);
        this.seleccion.set({ tipo: 'NODO', id: creado.id });
        this.aviso.set(`«${nombre}» creado. Completa sus datos en el panel de propiedades.`);
      },
      error: (err: HttpErrorResponse) => {
        this.creando.set(false);
        this.message.set(err.error?.detail ?? 'No fue posible crear la figura');
        this.inputBorrador()?.nativeElement.focus();
      }
    });
  }

  // ---- Selección y movimiento ----

  seleccionarNodo(nodo: NodoDiagrama, event?: Event): void {
    event?.stopPropagation();
    if (this.borrador()) return;
    this.seleccion.set({ tipo: 'NODO', id: nodo.id });
    this.eliminacion.set(null);
  }

  teclaEnNodo(event: KeyboardEvent, nodo: NodoDiagrama): void {
    if (event.key === 'Enter') {
      this.seleccionarNodo(nodo, event);
      return;
    }
    if (event.key === 'Delete') {
      event.preventDefault();
      this.seleccionarNodo(nodo, event);
      this.pedirEliminacion();
      return;
    }
    const paso = PASOS_TECLADO[event.key];
    if (!paso || !this.puedeEditar() || this.guardando()) return;
    event.preventDefault();
    const distancia = event.shiftKey ? GRILLA * 5 : GRILLA;
    this.reubicar(nodo, { x: paso.x * distancia, y: paso.y * distancia }, true);
  }

  mover(nodo: NodoDiagrama, event: CdkDragMove): void {
    this.arrastre.set({ id: nodo.id, delta: event.source.getFreeDragPosition() });
  }

  soltar(nodo: NodoDiagrama, event: CdkDragEnd): void {
    const delta = event.source.getFreeDragPosition();
    event.source.reset();
    this.arrastre.set(null);
    this.reubicar(nodo, delta, false);
  }

  private reubicar(nodo: NodoDiagrama, delta: Punto, enfocar: boolean): void {
    const diagrama = this.diagrama();
    const layout = this.layout();
    if (!diagrama || !layout) return;

    const destino = posicionAlSoltar(layout, nodo, delta);
    if (destino.laneId === nodo.laneId && destino.x === nodo.x && destino.y === nodo.y) return;

    // Se muestra la nueva posición de inmediato y se revierte si el backend la rechaza.
    this.diagrama.set(aplicarPosicion(diagrama, nodo, destino));
    this.seleccion.set({ tipo: 'NODO', id: nodo.id });
    this.guardando.set(true);
    this.message.set('');
    this.aviso.set('');
    if (enfocar) {
      // Al cambiar de lane el nodo se vuelve a crear en otra banda y pierde el foco.
      afterNextRender(() => this.enfocarNodo(nodo.id), { injector: this.injector });
    }

    this.guardarPosicion(diagrama, nodo, destino.laneId, destino.x, destino.y).subscribe({
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

  private enfocarNodo(id: number): void {
    this.lienzo()?.nativeElement.querySelector<HTMLElement>(`[data-nodo="${id}"]`)?.focus();
  }

  private guardarPosicion(
    d: ProcesoDiagramaResponse,
    nodo: NodoDiagrama,
    laneId: number,
    x: number,
    y: number
  ): Observable<unknown> {
    const posicion = { posicionX: x, posicionY: y };
    switch (nodo.tipo) {
      case 'ACTIVIDAD': {
        const a = d.actividades.find(actividad => actividad.id === nodo.id)!;
        return this.actividadService.editar(a.id, {
          nombre: a.nombre,
          descripcion: a.descripcion ?? undefined,
          tipoActividad: a.tipoActividad,
          laneId,
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

  // ---- Panel de propiedades ----

  guardarActividad(cambios: CambiosActividad): void {
    const actividad = this.actividadSeleccionada();
    if (!actividad) return;
    this.ejecutarGuardado(
      this.actividadService.editar(actividad.id, {
        ...cambios,
        posicionX: actividad.posicionX,
        posicionY: actividad.posicionY
      }).pipe(tap(actualizada => this.diagrama.update(d => d && {
        ...d,
        actividades: d.actividades.map(a => a.id === actualizada.id ? actualizada : a)
      })))
    );
  }

  guardarGateway(cambios: CambiosGateway): void {
    const gateway = this.gatewaySeleccionado();
    if (!gateway) return;
    // Al cambiar a paralelo el backend quita las condiciones de los arcos: se recarga el diagrama.
    this.ejecutarGuardado(
      this.gatewayService.editar(gateway.id, {
        ...cambios,
        posicionX: gateway.posicionX,
        posicionY: gateway.posicionY
      }),
      true
    );
  }

  private ejecutarGuardado(guardado$: Observable<unknown>, recargar = false): void {
    this.guardando.set(true);
    this.message.set('');
    this.aviso.set('');
    guardado$.subscribe({
      next: () => {
        this.guardando.set(false);
        this.aviso.set('Cambios guardados');
        if (recargar) {
          this.refrescar();
        }
      },
      error: (err: HttpErrorResponse) => {
        this.guardando.set(false);
        this.message.set(err.error?.detail ?? 'No fue posible guardar los cambios');
      }
    });
  }

  // ---- Eliminación con confirmación ----

  pedirEliminacion(): void {
    const seleccion = this.seleccion();
    const diagrama = this.diagrama();
    if (!seleccion || !diagrama || !this.puedeEliminar()) return;

    if (seleccion.tipo === 'NODO') {
      const actividad = diagrama.actividades.find(a => a.id === seleccion.id);
      if (actividad) {
        this.prepararEliminacion(actividad.nombre, this.actividadService.evaluarImpacto(actividad.id),
          () => this.actividadService.eliminar(actividad.id));
        return;
      }
      const gateway = diagrama.gateways.find(g => g.id === seleccion.id);
      if (gateway) {
        this.prepararEliminacion(gateway.nombre, this.gatewayService.evaluarImpacto(gateway.id),
          () => this.gatewayService.eliminar(gateway.id));
        return;
      }
      const evento = diagrama.eventos.find(e => e.id === seleccion.id);
      if (evento) {
        this.prepararEliminacion(evento.nombre, of(SIN_IMPACTO), () => this.eventoMensajeService.eliminar(evento.id));
      }
    }
  }

  private prepararEliminacion(nombre: string, impacto$: Observable<ImpactoEliminacionResponse>, ejecutar: () => Observable<void>): void {
    this.message.set('');
    impacto$.subscribe({
      next: impacto => this.eliminacion.set({ nombre, impacto, ejecutar }),
      error: (err: HttpErrorResponse) => this.message.set(err.error?.detail ?? 'No fue posible evaluar la eliminación')
    });
  }

  confirmarEliminacion(): void {
    const eliminacion = this.eliminacion();
    if (!eliminacion) return;
    this.guardando.set(true);
    eliminacion.ejecutar().subscribe({
      next: () => {
        this.guardando.set(false);
        this.eliminacion.set(null);
        this.seleccion.set(null);
        this.aviso.set(`«${eliminacion.nombre}» eliminado`);
        this.refrescar();
      },
      error: (err: HttpErrorResponse) => {
        this.guardando.set(false);
        this.message.set(err.error?.detail ?? 'No fue posible eliminar');
      }
    });
  }

  // Esc deshace el paso más reciente: borrador, colocación pendiente, confirmación o selección.
  escape(): void {
    if (this.borrador()) {
      this.cancelarBorrador();
    } else if (this.pendiente()) {
      this.pendiente.set(null);
      this.aviso.set('');
    } else if (this.eliminacion()) {
      this.eliminacion.set(null);
    } else {
      this.seleccion.set(null);
    }
  }
}
