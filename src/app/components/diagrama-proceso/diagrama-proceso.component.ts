import {
  ChangeDetectionStrategy, Component, ElementRef, Injector, afterNextRender, computed, effect, inject, input,
  signal, viewChild
} from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { CdkDrag, CdkDragEnd, CdkDragMove, DragConstrainPosition } from '@angular/cdk/drag-drop';
import { Observable, of, tap } from 'rxjs';
import { ProcesoService } from '../../services/proceso.service';
import { ActividadService } from '../../services/actividad.service';
import { GatewayService } from '../../services/gateway.service';
import { EventoMensajeService } from '../../services/evento-mensaje.service';
import { ArcoService } from '../../services/arco.service';
import { MensajeService } from '../../services/mensaje.service';
import { LaneService } from '../../services/lane.service';
import { PoolService } from '../../services/pool.service';
import { RolProcesoService } from '../../services/rol-proceso.service';
import { TokenService } from '../../services/token.service';
import { ProcesoDiagramaResponse } from '../../models/proceso.model';
import { TipoActividad } from '../../models/actividad.model';
import { TipoGateway } from '../../models/gateway.model';
import { TipoEventoMensaje } from '../../models/evento-mensaje.model';
import { RolProcesoVistaResponse } from '../../models/rol-proceso.model';
import { ImpactoEliminacionResponse } from '../../models/impacto-eliminacion.model';
import {
  BorradorMensaje, BorradorNodo, CambiosActividad, CambiosArco, CambiosEvento, CambiosGateway, CambiosLane,
  CambiosMensaje, CambiosPool, ConexionDiagrama, ElementoPaleta, LaneDiagrama, NodoDiagrama, OpcionLane, OpcionNodo,
  PoolDiagrama, Punto, Seleccion, TipoElementoPaleta, TipoNodoDiagrama
} from '../../models/diagrama.model';
import { TramoNavegacion } from '../../models/navegacion.model';
import { RutaNavegacionComponent } from '../ruta-navegacion/ruta-navegacion.component';
import { NodoDiagramaComponent } from '../nodo-diagrama/nodo-diagrama.component';
import { PaletaModeladoComponent } from '../paleta-modelado/paleta-modelado.component';
import { PropiedadesActividadComponent } from '../propiedades-actividad/propiedades-actividad.component';
import { PropiedadesGatewayComponent } from '../propiedades-gateway/propiedades-gateway.component';
import { PropiedadesArcoComponent } from '../propiedades-arco/propiedades-arco.component';
import { PropiedadesEventoComponent } from '../propiedades-evento/propiedades-evento.component';
import { PropiedadesMensajeComponent } from '../propiedades-mensaje/propiedades-mensaje.component';
import { PropiedadesLaneComponent } from '../propiedades-lane/propiedades-lane.component';
import { PropiedadesPoolComponent } from '../propiedades-pool/propiedades-pool.component';
import { ConfirmarEliminacionComponent } from '../confirmar-eliminacion/confirmar-eliminacion.component';
import {
  GRILLA, ajustar, aplicarPosicion, construirLayout, posicionAlSoltar, posicionEnLane, siguienteEspacioLibre,
  tamanoDe, trazarConexiones
} from './diagrama.layout';
import {
  buscarNodo, esPoolExterno, motivoDestino, motivoNoConectable, motivoNoMensajeAPool, opcionesDelPool, poolDeNodo,
  requiereCondicion, revisarModelo
} from './reglas-modelado';

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
    ReactiveFormsModule, CdkDrag, RutaNavegacionComponent, NodoDiagramaComponent, PaletaModeladoComponent,
    PropiedadesActividadComponent, PropiedadesGatewayComponent, PropiedadesArcoComponent, PropiedadesEventoComponent,
    PropiedadesMensajeComponent, PropiedadesLaneComponent, PropiedadesPoolComponent, ConfirmarEliminacionComponent
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
  private readonly arcoService = inject(ArcoService);
  private readonly mensajeService = inject(MensajeService);
  private readonly laneService = inject(LaneService);
  private readonly poolService = inject(PoolService);
  private readonly rolProcesoService = inject(RolProcesoService);
  private readonly tokens = inject(TokenService);
  private readonly injector = inject(Injector);

  id = input.required<string>();
  tramos = input<TramoNavegacion[]>([]);

  protected readonly status = signal<'loading' | 'success' | 'error'>('loading');
  protected readonly diagrama = signal<ProcesoDiagramaResponse | null>(null);
  protected readonly roles = signal<RolProcesoVistaResponse[]>([]);
  protected readonly message = signal('');
  protected readonly guardando = signal(false);
  protected readonly aviso = signal('');
  protected readonly seleccion = signal<Seleccion | null>(null);
  protected readonly pendiente = signal<ElementoPaleta | null>(null);
  protected readonly laneDestino = signal<number | null>(null);
  protected readonly poolDestino = signal<number | null>(null);
  protected readonly borrador = signal<BorradorNodo | null>(null);
  protected readonly creando = signal(false);
  protected readonly eliminacion = signal<EliminacionPendiente | null>(null);
  protected readonly nombreBorrador = new FormControl('', { nonNullable: true, validators: Validators.required });
  protected readonly conectandoDesde = signal<NodoDiagrama | null>(null);
  protected readonly borradorArco = signal<{ origenId: number; destinoId: number } | null>(null);
  protected readonly borradorMensaje = signal<BorradorMensaje | null>(null);
  protected readonly borradorLane = signal<number | null>(null);
  protected readonly borradorPool = signal(false);
  private readonly puntero = signal<Punto | null>(null);
  private readonly arrastrePaleta = signal<ElementoPaleta | null>(null);
  private readonly arrastre = signal<{ id: number; delta: Punto } | null>(null);
  protected readonly arrastrando = computed(() => this.arrastre() !== null);
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

  protected readonly advertencias = computed(() => {
    const diagrama = this.diagrama();
    return diagrama ? revisarModelo(diagrama) : [];
  });

  protected readonly pendienteEsNodo = computed(() => {
    const pendiente = this.pendiente();
    return pendiente !== null && esTipoNodo(pendiente.tipo);
  });

  protected readonly nodoBorrador = computed<NodoDiagrama | null>(() => {
    const borrador = this.borrador();
    return borrador ? { id: -1, nombre: '', ...borrador, ...tamanoDe(borrador.tipo) } : null;
  });

  // ---- Datos del panel según lo seleccionado ----

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

  protected readonly datosEvento = computed<{ clave: string; datos: CambiosEvento } | null>(() => {
    const seleccion = this.seleccion();
    const evento = seleccion?.tipo === 'NODO' ? this.diagrama()?.eventos.find(e => e.id === seleccion.id) : undefined;
    if (evento) {
      const { nombre, tipoEvento, contenido, claveCorrelacion, origenExterno } = evento;
      return { clave: `e${evento.id}`, datos: { nombre, tipoEvento, contenido, claveCorrelacion, origenExterno } };
    }
    const borrador = this.borrador();
    return borrador?.tipo === 'EVENTO'
      ? {
          clave: 'nuevo-evento',
          datos: {
            nombre: '',
            tipoEvento: borrador.subtipo as TipoEventoMensaje,
            contenido: '',
            claveCorrelacion: '',
            origenExterno: false
          }
        }
      : null;
  });

  protected readonly arcoSeleccionado = computed(() => {
    const seleccion = this.seleccion();
    return seleccion?.tipo === 'ARCO' ? this.diagrama()?.arcos.find(a => a.id === seleccion.id) ?? null : null;
  });

  protected readonly datosArco = computed<{ clave: string; datos: CambiosArco } | null>(() => {
    const arco = this.arcoSeleccionado();
    if (arco) {
      return {
        clave: `a${arco.id}`,
        datos: { origenId: arco.origenId, destinoId: arco.destinoId, etiqueta: arco.etiqueta ?? '', condicion: arco.condicion ?? '' }
      };
    }
    const borrador = this.borradorArco();
    return borrador
      ? { clave: 'nuevo', datos: { origenId: borrador.origenId, destinoId: borrador.destinoId, etiqueta: '', condicion: '' } }
      : null;
  });

  protected readonly nodosDelArco = computed<OpcionNodo[]>(() => {
    const diagrama = this.diagrama();
    const origenId = this.datosArco()?.datos.origenId;
    return diagrama && origenId !== undefined ? opcionesDelPool(diagrama, poolDeNodo(diagrama, origenId)) : [];
  });

  protected readonly mensajeSeleccionado = computed(() => {
    const seleccion = this.seleccion();
    return seleccion?.tipo === 'MENSAJE' ? this.diagrama()?.mensajes.find(m => m.id === seleccion.id) ?? null : null;
  });

  protected readonly datosMensaje = computed<{ clave: string; datos: CambiosMensaje; externo: boolean; sinReceptor: boolean } | null>(() => {
    const diagrama = this.diagrama();
    if (!diagrama) return null;
    const mensaje = this.mensajeSeleccionado();
    if (mensaje) {
      return {
        clave: `m${mensaje.id}`,
        externo: esPoolExterno(diagrama, mensaje.poolDestinoId),
        sinReceptor: mensaje.sinReceptor,
        datos: {
          nombre: mensaje.nombre,
          contenido: mensaje.contenido,
          claveCorrelacion: mensaje.claveCorrelacion ?? '',
          politicaSinCaso: mensaje.politicaSinCaso ?? 'DESCARTAR',
          tipoDestinoExterno: mensaje.tipoDestinoExterno,
          destinoExterno: mensaje.destinoExterno ?? '',
          politicaFalloNotificacion: mensaje.politicaFalloNotificacion,
          actividadErrorId: mensaje.actividadErrorId
        }
      };
    }
    const borrador = this.borradorMensaje();
    const envio = borrador ? diagrama.eventos.find(e => e.id === borrador.eventoThrowId) : undefined;
    return envio
      ? {
          clave: 'nuevo-mensaje',
          externo: true,
          sinReceptor: false,
          datos: {
            nombre: envio.nombre,
            contenido: envio.contenido,
            claveCorrelacion: envio.claveCorrelacion,
            politicaSinCaso: 'DESCARTAR',
            tipoDestinoExterno: null,
            destinoExterno: '',
            politicaFalloNotificacion: null,
            actividadErrorId: null
          }
        }
      : null;
  });

  protected readonly actividadesDelProceso = computed<OpcionLane[]>(() =>
    (this.diagrama()?.actividades ?? []).map(a => ({ id: a.id, nombre: a.nombre })));

  protected readonly datosLane = computed<{
    clave: string; datos: CambiosLane; pool: string; puedeSubir: boolean; puedeBajar: boolean
  } | null>(() => {
    const diagrama = this.diagrama();
    if (!diagrama) return null;
    const seleccion = this.seleccion();
    const lane = seleccion?.tipo === 'LANE' ? diagrama.lanes.find(l => l.id === seleccion.id) : undefined;
    const poolId = lane?.poolId ?? this.borradorLane();
    const pool = diagrama.pools.find(p => p.id === poolId);
    if (!pool) return null;
    if (lane) {
      const hermanos = diagrama.lanes.filter(l => l.poolId === pool.id).sort((a, b) => a.orden - b.orden);
      const indice = hermanos.findIndex(l => l.id === lane.id);
      return {
        clave: `l${lane.id}`,
        datos: { nombre: lane.nombre, rolProcesoId: lane.rolProcesoId },
        pool: pool.nombre,
        puedeSubir: indice > 0,
        puedeBajar: indice < hermanos.length - 1
      };
    }
    return {
      clave: `nuevo-lane-${pool.id}`,
      datos: { nombre: '', rolProcesoId: 0 },
      pool: pool.nombre,
      puedeSubir: false,
      puedeBajar: false
    };
  });

  protected readonly datosPool = computed<{ clave: string; datos: CambiosPool; tieneLanes: boolean } | null>(() => {
    const diagrama = this.diagrama();
    const seleccion = this.seleccion();
    const pool = seleccion?.tipo === 'POOL' ? diagrama?.pools.find(p => p.id === seleccion.id) : undefined;
    if (pool && diagrama) {
      return {
        clave: `p${pool.id}`,
        datos: { nombre: pool.nombre, tipoParticipante: pool.tipoParticipante, cajaNegra: pool.cajaNegra },
        tieneLanes: diagrama.lanes.some(l => l.poolId === pool.id)
      };
    }
    return this.borradorPool()
      ? { clave: 'nuevo-pool', datos: { nombre: '', tipoParticipante: 'EMPRESA', cajaNegra: false }, tieneLanes: false }
      : null;
  });

  // ---- Modo conectar ----

  // Mientras se conecta, cada nodo sabe si puede ser destino y, si no, por qué.
  protected readonly motivosDestino = computed(() => {
    const origen = this.conectandoDesde();
    const diagrama = this.diagrama();
    const mapa = new Map<number, string | null>();
    if (origen && diagrama) {
      for (const id of this.layout()?.cajas.keys() ?? []) {
        mapa.set(id, motivoDestino(diagrama, origen.id, id));
      }
    }
    return mapa;
  });

  // Un Message Throw también puede apuntar a un pool de caja negra (cliente o sistema externo).
  protected readonly motivosPoolDestino = computed(() => {
    const origen = this.conectandoDesde();
    const diagrama = this.diagrama();
    const mapa = new Map<number, string | null>();
    if (origen?.subtipo === 'THROW' && diagrama) {
      for (const pool of diagrama.pools.filter(p => p.cajaNegra)) {
        mapa.set(pool.id, motivoNoMensajeAPool(diagrama, origen.id, pool.id));
      }
    }
    return mapa;
  });

  protected readonly lineaConexion = computed(() => {
    const origen = this.conectandoDesde();
    const puntero = this.puntero();
    const caja = origen ? this.layout()?.cajas.get(origen.id) : undefined;
    if (!caja || !puntero) return null;
    return { x1: caja.x + caja.ancho / 2, y1: caja.y + caja.alto / 2, x2: puntero.x, y2: puntero.y };
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

  constructor() {
    effect(() => this.inputBorrador()?.nativeElement.focus());
  }

  ngOnInit(): void {
    this.load();
    this.rolProcesoService.listar().subscribe({
      next: roles => this.roles.set(roles),
      error: () => this.roles.set([])
    });
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

  // Deja el panel listo para una sola tarea a la vez.
  private limpiarPanel(): void {
    this.seleccion.set(null);
    this.eliminacion.set(null);
    this.borradorArco.set(null);
    this.borradorMensaje.set(null);
    this.borradorLane.set(null);
    this.borradorPool.set(false);
  }

  // ---- Paleta ----

  elegirDePaleta(elemento: ElementoPaleta): void {
    this.cancelarBorrador();
    this.cancelarConexion();
    if (elemento.tipo === 'POOL') {
      this.abrirNuevoPool();
      return;
    }
    if (this.pendiente() === elemento) {
      this.pendiente.set(null);
      this.aviso.set('');
      return;
    }
    this.pendiente.set(elemento);
    this.aviso.set(elemento.tipo === 'LANE'
      ? 'Haz clic en el pool donde quieres agregar el lane. Esc cancela.'
      : `Haz clic en un lane para colocar «${elemento.etiqueta}», o usa «Colocar aquí». Esc cancela.`);
  }

  iniciarArrastrePaleta(elemento: ElementoPaleta): void {
    this.cancelarBorrador();
    this.cancelarConexion();
    this.pendiente.set(null);
    this.arrastrePaleta.set(elemento);
  }

  terminarArrastrePaleta(): void {
    this.arrastrePaleta.set(null);
    this.laneDestino.set(null);
    this.poolDestino.set(null);
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
    if (!elemento || !esTipoNodo(elemento.tipo)) return;
    this.terminarArrastrePaleta();
    event.preventDefault();
    this.colocarEnPunto(event, lane, elemento);
  }

  sobrePool(event: DragEvent, pool: PoolDiagrama): void {
    if (this.arrastrePaleta()?.tipo !== 'LANE' || pool.cajaNegra) return;
    event.preventDefault();
    this.poolDestino.set(pool.id);
  }

  soltarEnPool(event: DragEvent, pool: PoolDiagrama): void {
    if (this.arrastrePaleta()?.tipo !== 'LANE' || pool.cajaNegra) return;
    this.terminarArrastrePaleta();
    event.preventDefault();
    this.abrirNuevoLane(pool.id);
  }

  sobreLienzo(event: DragEvent): void {
    if (this.arrastrePaleta()?.tipo === 'POOL') {
      event.preventDefault();
    }
  }

  soltarEnLienzo(event: DragEvent): void {
    if (this.arrastrePaleta()?.tipo !== 'POOL') return;
    this.terminarArrastrePaleta();
    event.preventDefault();
    this.abrirNuevoPool();
  }

  clicEnLane(event: MouseEvent, lane: LaneDiagrama): void {
    if (this.conectandoDesde()) {
      this.cancelarConexion();
      return;
    }
    const elemento = this.pendiente();
    if (!elemento) {
      this.limpiarPanel();
      return;
    }
    this.colocarEnPunto(event, lane, elemento);
  }

  clicEnPool(event: Event, pool: PoolDiagrama): void {
    if (this.pendiente()?.tipo !== 'LANE') return;
    event.stopPropagation();
    if (pool.cajaNegra) {
      this.message.set('Un pool de caja negra no puede contener lanes.');
      return;
    }
    this.abrirNuevoLane(pool.id);
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

  abrirNuevoPool(): void {
    this.cancelarBorrador();
    this.pendiente.set(null);
    this.limpiarPanel();
    this.borradorPool.set(true);
    this.aviso.set('Completa los datos del nuevo pool en el panel.');
  }

  private abrirNuevoLane(poolId: number): void {
    this.cancelarBorrador();
    this.pendiente.set(null);
    this.limpiarPanel();
    this.borradorLane.set(poolId);
    this.aviso.set('Completa los datos del nuevo lane en el panel.');
  }

  // ---- Borrador: la figura recién soltada espera sus datos antes de crearse ----

  private iniciarBorrador(tipo: TipoNodoDiagrama, subtipo: NodoDiagrama['subtipo'], lane: LaneDiagrama, posicion: Punto): void {
    this.pendiente.set(null);
    this.limpiarPanel();
    this.message.set('');
    // Los eventos exigen contenido y clave de correlación: se completan en el panel.
    this.aviso.set(tipo === 'EVENTO'
      ? 'Completa los datos del evento en el panel de propiedades. Esc cancela.'
      : 'Escribe el nombre y pulsa Enter para crear. Esc cancela.');
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
    if (!borrador || borrador.tipo === 'EVENTO' || this.creando()) return;
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
    if (this.conectandoDesde()) {
      this.completarConexion(nodo);
      return;
    }
    this.limpiarPanel();
    this.seleccion.set({ tipo: 'NODO', id: nodo.id });
  }

  seleccionarConexion(conexion: ConexionDiagrama, event?: Event): void {
    event?.stopPropagation();
    if (this.borrador() || this.conectandoDesde()) return;
    this.limpiarPanel();
    this.seleccion.set({ tipo: conexion.tipo === 'MENSAJE' ? 'MENSAJE' : 'ARCO', id: conexion.id });
  }

  seleccionarLane(lane: LaneDiagrama, event: Event): void {
    event.stopPropagation();
    if (this.borrador()) return;
    this.cancelarConexion();
    this.pendiente.set(null);
    this.limpiarPanel();
    this.seleccion.set({ tipo: 'LANE', id: lane.id });
  }

  seleccionarPool(pool: PoolDiagrama, event: Event): void {
    event.stopPropagation();
    if (this.borrador()) return;
    if (this.pendiente()?.tipo === 'LANE') {
      this.clicEnPool(event, pool);
      return;
    }
    this.cancelarConexion();
    this.pendiente.set(null);
    this.limpiarPanel();
    this.seleccion.set({ tipo: 'POOL', id: pool.id });
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
    if (!paso || !this.puedeEditar() || this.guardando() || this.conectandoDesde()) return;
    event.preventDefault();
    const distancia = event.shiftKey ? GRILLA * 5 : GRILLA;
    this.reubicar(nodo, { x: paso.x * distancia, y: paso.y * distancia }, true);
  }

  teclaEnConexion(event: KeyboardEvent, conexion: ConexionDiagrama): void {
    if (event.key === 'Enter') {
      this.seleccionarConexion(conexion, event);
    } else if (event.key === 'Delete') {
      event.preventDefault();
      this.seleccionarConexion(conexion, event);
      this.pedirEliminacion();
    }
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
    this.limpiarPanel();
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

  // ---- Conexiones: como el ContextPad de bpmn-js, se parte del nodo seleccionado ----

  iniciarConexion(nodo: NodoDiagrama, event: Event): void {
    event.stopPropagation();
    this.conectandoDesde.set(nodo);
    this.puntero.set(null);
    this.message.set('');
    this.aviso.set(nodo.subtipo === 'THROW'
      ? `Elige el Message Catch o el pool externo que recibe «${nodo.nombre}». Esc cancela.`
      : `Elige el destino del arco que sale de «${nodo.nombre}». Esc cancela.`);
  }

  moverPuntero(event: PointerEvent): void {
    if (!this.conectandoDesde()) return;
    const lienzo = this.lienzo()?.nativeElement.getBoundingClientRect();
    if (lienzo) {
      this.puntero.set({ x: event.clientX - lienzo.left, y: event.clientY - lienzo.top });
    }
  }

  cancelarConexion(): void {
    if (this.conectandoDesde()) {
      this.aviso.set('');
    }
    this.conectandoDesde.set(null);
    this.puntero.set(null);
  }

  private completarConexion(destino: NodoDiagrama): void {
    const origen = this.conectandoDesde();
    const diagrama = this.diagrama();
    if (!origen || !diagrama) return;
    const motivo = motivoDestino(diagrama, origen.id, destino.id);
    if (motivo) {
      this.message.set(motivo);
      return;
    }
    this.cancelarConexion();

    if (origen.subtipo === 'THROW' && poolDeNodo(diagrama, origen.id) !== poolDeNodo(diagrama, destino.id)) {
      this.crearMensaje(origen.id, poolDeNodo(diagrama, destino.id)!, destino.id);
      return;
    }

    const arco = { origenId: origen.id, destinoId: destino.id, etiqueta: '', condicion: '' };
    if (requiereCondicion(diagrama, origen.id)) {
      this.limpiarPanel();
      this.borradorArco.set({ origenId: arco.origenId, destinoId: arco.destinoId });
      this.aviso.set('El arco sale de un gateway: escribe su condición en el panel.');
      return;
    }
    this.crearArco(arco);
  }

  clicEnPoolVacio(pool: PoolDiagrama, event: Event): void {
    const origen = this.conectandoDesde();
    const diagrama = this.diagrama();
    if (!origen || !diagrama) return;
    event.stopPropagation();
    const motivo = origen.subtipo === 'THROW'
      ? motivoNoMensajeAPool(diagrama, origen.id, pool.id)
      : 'Un pool de caja negra solo recibe mensajes desde un Message Throw.';
    if (motivo) {
      this.message.set(motivo);
      return;
    }
    this.cancelarConexion();
    if (esPoolExterno(diagrama, pool.id)) {
      // Una notificación externa (HU-26) exige documentar destino y política de fallo.
      this.limpiarPanel();
      this.borradorMensaje.set({ eventoThrowId: origen.id, poolDestinoId: pool.id });
      this.aviso.set('Documenta la notificación externa en el panel.');
      return;
    }
    this.crearMensaje(origen.id, pool.id, null);
  }

  // El mensaje hereda nombre, contenido y clave del Throw: el backend exige que coincidan.
  private crearMensaje(eventoThrowId: number, poolDestinoId: number, eventoCatchId: number | null, extra?: CambiosMensaje): void {
    const diagrama = this.diagrama();
    const envio = diagrama?.eventos.find(e => e.id === eventoThrowId);
    const poolOrigenId = diagrama ? poolDeNodo(diagrama, eventoThrowId) : undefined;
    if (!envio || poolOrigenId === undefined) return;
    this.ejecutarCreacion(
      this.mensajeService.crear(Number(this.id()), {
        nombre: envio.nombre,
        contenido: extra?.contenido ?? envio.contenido,
        poolOrigenId,
        poolDestinoId,
        eventoThrowId,
        eventoCatchId: eventoCatchId ?? undefined,
        claveCorrelacion: envio.claveCorrelacion,
        politicaSinCaso: extra?.politicaSinCaso ?? 'DESCARTAR',
        tipoDestinoExterno: extra?.tipoDestinoExterno ?? undefined,
        destinoExterno: extra?.destinoExterno || undefined,
        politicaFalloNotificacion: extra?.politicaFalloNotificacion ?? undefined,
        actividadErrorId: extra?.actividadErrorId ?? undefined
      }),
      mensaje => {
        this.diagrama.update(d => d && { ...d, mensajes: [...d.mensajes, mensaje] });
        this.limpiarPanel();
        this.seleccion.set({ tipo: 'MENSAJE', id: mensaje.id });
      },
      'Mensaje creado'
    );
  }

  private crearArco(cambios: CambiosArco): void {
    this.ejecutarCreacion(
      this.arcoService.crear({
        origenId: cambios.origenId,
        destinoId: cambios.destinoId,
        etiqueta: cambios.etiqueta || undefined,
        condicion: cambios.condicion || undefined
      }),
      arco => {
        this.diagrama.update(d => d && { ...d, arcos: [...d.arcos, arco] });
        this.limpiarPanel();
        this.seleccion.set({ tipo: 'ARCO', id: arco.id });
      },
      'Arco creado'
    );
  }

  private ejecutarCreacion<T>(creacion$: Observable<T>, alCrear: (creado: T) => void, aviso: string): void {
    this.guardando.set(true);
    this.message.set('');
    creacion$.subscribe({
      next: creado => {
        this.guardando.set(false);
        alCrear(creado);
        this.aviso.set(aviso);
      },
      error: (err: HttpErrorResponse) => {
        this.guardando.set(false);
        this.message.set(err.error?.detail ?? 'No fue posible crear el elemento');
      }
    });
  }

  nombreDeNodo(id: number): string {
    const diagrama = this.diagrama();
    return (diagrama && buscarNodo(diagrama, id)?.nombre) ?? '';
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

  guardarEvento(cambios: CambiosEvento): void {
    const borrador = this.borrador();
    if (borrador?.tipo === 'EVENTO') {
      this.ejecutarCreacion(
        this.eventoMensajeService.crear(borrador.laneId, { ...cambios, posicionX: borrador.x, posicionY: borrador.y }),
        evento => {
          this.diagrama.update(d => d && { ...d, eventos: [...d.eventos, evento] });
          this.borrador.set(null);
          this.limpiarPanel();
          this.seleccion.set({ tipo: 'NODO', id: evento.id });
        },
        `«${cambios.nombre}» creado`
      );
      return;
    }
    const seleccion = this.seleccion();
    const evento = seleccion?.tipo === 'NODO' ? this.diagrama()?.eventos.find(e => e.id === seleccion.id) : undefined;
    if (!evento) return;
    // Renombrar un evento puede dejar mensajes sin receptor: se recarga para verlo.
    this.ejecutarGuardado(
      this.eventoMensajeService.editar(evento.id, { ...cambios, posicionX: evento.posicionX, posicionY: evento.posicionY }),
      true
    );
  }

  guardarArco(cambios: CambiosArco): void {
    const diagrama = this.diagrama();
    if (!diagrama) return;
    const arco = this.arcoSeleccionado();
    const motivo = motivoNoConectable(diagrama, cambios.origenId, cambios.destinoId, arco?.id);
    if (motivo) {
      this.message.set(motivo);
      return;
    }
    if (!arco) {
      this.crearArco(cambios);
      return;
    }
    this.ejecutarGuardado(
      this.arcoService.editar(arco.id, cambios).pipe(tap(actualizado => this.diagrama.update(d => d && {
        ...d,
        arcos: d.arcos.map(a => a.id === actualizado.id ? actualizado : a)
      })))
    );
  }

  guardarMensaje(cambios: CambiosMensaje): void {
    const borrador = this.borradorMensaje();
    if (borrador) {
      this.crearMensaje(borrador.eventoThrowId, borrador.poolDestinoId, null, cambios);
      return;
    }
    const mensaje = this.mensajeSeleccionado();
    if (!mensaje) return;
    this.ejecutarGuardado(
      this.mensajeService.editar(mensaje.id, {
        nombre: mensaje.nombre,
        contenido: cambios.contenido,
        eventoCatchId: mensaje.eventoCatchId ?? undefined,
        claveCorrelacion: mensaje.claveCorrelacion ?? undefined,
        politicaSinCaso: cambios.politicaSinCaso,
        tipoDestinoExterno: cambios.tipoDestinoExterno ?? undefined,
        destinoExterno: cambios.destinoExterno || undefined,
        politicaFalloNotificacion: cambios.politicaFalloNotificacion ?? undefined,
        actividadErrorId: cambios.actividadErrorId ?? undefined
      }).pipe(tap(actualizado => this.diagrama.update(d => d && {
        ...d,
        mensajes: d.mensajes.map(m => m.id === actualizado.id ? actualizado : m)
      })))
    );
  }

  guardarLane(cambios: CambiosLane): void {
    const poolNuevo = this.borradorLane();
    if (poolNuevo !== null) {
      this.ejecutarCreacion(
        this.laneService.crear(poolNuevo, cambios),
        lane => {
          this.diagrama.update(d => d && { ...d, lanes: [...d.lanes, lane] });
          this.limpiarPanel();
          this.seleccion.set({ tipo: 'LANE', id: lane.id });
        },
        `Lane «${cambios.nombre}» creado`
      );
      return;
    }
    const seleccion = this.seleccion();
    const lane = seleccion?.tipo === 'LANE' ? this.diagrama()?.lanes.find(l => l.id === seleccion.id) : undefined;
    if (!lane) return;
    this.ejecutarGuardado(
      this.laneService.editar(lane.id, cambios).pipe(tap(actualizado => this.diagrama.update(d => d && {
        ...d,
        lanes: d.lanes.map(l => l.id === actualizado.id ? actualizado : l)
      })))
    );
  }

  moverLane(direccion: -1 | 1): void {
    const diagrama = this.diagrama();
    const seleccion = this.seleccion();
    const lane = seleccion?.tipo === 'LANE' ? diagrama?.lanes.find(l => l.id === seleccion.id) : undefined;
    if (!diagrama || !lane) return;
    const ids = diagrama.lanes.filter(l => l.poolId === lane.poolId).sort((a, b) => a.orden - b.orden).map(l => l.id);
    const desde = ids.indexOf(lane.id);
    const hasta = desde + direccion;
    if (hasta < 0 || hasta >= ids.length) return;
    [ids[desde], ids[hasta]] = [ids[hasta], ids[desde]];
    this.ejecutarGuardado(
      this.laneService.reordenar(lane.poolId, { laneIds: ids }).pipe(tap(reordenados => this.diagrama.update(d => d && {
        ...d,
        lanes: d.lanes.map(l => reordenados.find(r => r.id === l.id) ?? l)
      })))
    );
  }

  guardarPool(cambios: CambiosPool): void {
    if (this.borradorPool()) {
      this.ejecutarCreacion(
        this.poolService.crear(Number(this.id()), cambios),
        pool => {
          this.diagrama.update(d => d && { ...d, pools: [...d.pools, pool] });
          this.limpiarPanel();
          this.seleccion.set({ tipo: 'POOL', id: pool.id });
        },
        `Pool «${cambios.nombre}» creado`
      );
      return;
    }
    const seleccion = this.seleccion();
    const pool = seleccion?.tipo === 'POOL' ? this.diagrama()?.pools.find(p => p.id === seleccion.id) : undefined;
    if (!pool) return;
    this.ejecutarGuardado(
      this.poolService.editar(pool.id, cambios).pipe(tap(actualizado => this.diagrama.update(d => d && {
        ...d,
        pools: d.pools.map(p => p.id === actualizado.id ? actualizado : p)
      })))
    );
  }

  agregarLaneAlPool(): void {
    const seleccion = this.seleccion();
    if (seleccion?.tipo === 'POOL') {
      this.abrirNuevoLane(seleccion.id);
    }
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

    switch (seleccion.tipo) {
      case 'NODO': {
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
        return;
      }
      case 'ARCO': {
        const arco = diagrama.arcos.find(a => a.id === seleccion.id);
        if (arco) {
          const nombre = `arco ${this.nombreDeNodo(arco.origenId)} → ${this.nombreDeNodo(arco.destinoId)}`;
          this.prepararEliminacion(nombre, this.arcoService.evaluarImpacto(arco.id), () => this.arcoService.eliminar(arco.id));
        }
        return;
      }
      case 'MENSAJE': {
        const mensaje = diagrama.mensajes.find(m => m.id === seleccion.id);
        if (mensaje) {
          this.prepararEliminacion(`mensaje ${mensaje.nombre}`, of(SIN_IMPACTO), () => this.mensajeService.eliminar(mensaje.id));
        }
        return;
      }
      case 'LANE': {
        const lane = diagrama.lanes.find(l => l.id === seleccion.id);
        if (lane) {
          this.prepararEliminacion(`lane ${lane.nombre}`, of(SIN_IMPACTO), () => this.laneService.eliminar(lane.id));
        }
        return;
      }
      case 'POOL': {
        const pool = diagrama.pools.find(p => p.id === seleccion.id);
        if (pool) {
          this.prepararEliminacion(`pool ${pool.nombre}`, of(SIN_IMPACTO), () => this.poolService.eliminar(pool.id));
        }
        return;
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
        this.limpiarPanel();
        this.aviso.set(`«${eliminacion.nombre}» eliminado`);
        this.refrescar();
      },
      error: (err: HttpErrorResponse) => {
        this.guardando.set(false);
        this.message.set(err.error?.detail ?? 'No fue posible eliminar');
      }
    });
  }

  // Esc deshace el paso más reciente: borrador, conexión, colocación pendiente, confirmación o selección.
  escape(): void {
    if (this.borrador()) {
      this.cancelarBorrador();
    } else if (this.conectandoDesde()) {
      this.cancelarConexion();
    } else if (this.pendiente()) {
      this.pendiente.set(null);
      this.aviso.set('');
    } else if (this.eliminacion()) {
      this.eliminacion.set(null);
    } else {
      this.limpiarPanel();
      this.aviso.set('');
    }
  }
}
