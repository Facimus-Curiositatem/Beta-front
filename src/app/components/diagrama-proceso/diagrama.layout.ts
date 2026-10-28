import { ProcesoDiagramaResponse } from '../../models/proceso.model';
import {
  CajaDiagrama, ConexionDiagrama, DiagramaLayout, LaneDiagrama, NodoDiagrama,
  PoolDiagrama, PosicionNodo, Punto, TipoNodoDiagrama
} from '../../models/diagrama.model';

// Medidas tomadas de bpmn-js: ElementSizeUtil (figuras), LaneUtil (banda) y GridUtil (grilla).
export const GRILLA = 10;
export const BANDA = 30;
export const INICIO_CONTENIDO = BANDA * 2;
const MARGEN = 20;
const ALTO_LANE_MIN = 120;
const ALTO_POOL_SIN_LANES = 60;
const ANCHO_CONTENIDO_MIN = 600;
const SEPARACION_POOLS = 40;
const SEPARACION_NODOS = 50;
const ALTO_ETIQUETA_EXTERNA = 30;
const TAMANOS: Record<TipoNodoDiagrama, { ancho: number; alto: number }> = {
  ACTIVIDAD: { ancho: 100, alto: 80 },
  GATEWAY: { ancho: 50, alto: 50 },
  EVENTO: { ancho: 36, alto: 36 }
};

export function ajustar(valor: number): number {
  return Math.round(valor / GRILLA) * GRILLA;
}

function ajustarArriba(valor: number): number {
  return Math.ceil(valor / GRILLA) * GRILLA;
}

export function tamanoDe(tipo: TipoNodoDiagrama): { ancho: number; alto: number } {
  return TAMANOS[tipo];
}

// Centra la figura en el punto donde se soltó, relativo al contenido del lane.
export function posicionEnLane(lane: LaneDiagrama, tipo: TipoNodoDiagrama, puntoX: number, puntoY: number): Punto {
  const { ancho, alto } = TAMANOS[tipo];
  return {
    x: Math.max(GRILLA, ajustar(puntoX - ancho / 2)),
    y: Math.min(Math.max(GRILLA, ajustar(puntoY - alto / 2)), lane.alto - alto)
  };
}

export function siguienteEspacioLibre(lane: LaneDiagrama, tipo: TipoNodoDiagrama): Punto {
  const { alto } = TAMANOS[tipo];
  const x = Math.max(MARGEN, ...lane.nodos.map(n => n.x + n.ancho + SEPARACION_NODOS));
  return { x: ajustarArriba(x), y: Math.max(GRILLA, ajustar((ALTO_LANE_MIN - alto) / 2)) };
}

function crearNodo(
  tipo: TipoNodoDiagrama,
  id: number,
  subtipo: NodoDiagrama['subtipo'],
  nombre: string,
  laneId: number,
  x: number,
  y: number
): NodoDiagrama {
  return { id, tipo, subtipo, nombre, laneId, x, y, ...TAMANOS[tipo] };
}

function nodosDe(d: ProcesoDiagramaResponse): NodoDiagrama[] {
  return [
    ...d.actividades.map(a => crearNodo('ACTIVIDAD', a.id, a.tipoActividad, a.nombre, a.laneId, a.posicionX, a.posicionY)),
    ...d.gateways.map(g => crearNodo('GATEWAY', g.id, g.tipoGateway, g.nombre, g.laneId, g.posicionX, g.posicionY)),
    ...d.eventos.map(e => crearNodo('EVENTO', e.id, e.tipoEvento, e.nombre, e.laneId, e.posicionX, e.posicionY))
  ];
}

// (0,0) es el valor por defecto del backend: el nodo nunca se ubicó en el lienzo.
function ubicarPendientes(nodos: NodoDiagrama[]): NodoDiagrama[] {
  const ubicados = nodos.filter(n => n.x !== 0 || n.y !== 0);
  let siguienteX = Math.max(MARGEN, ...ubicados.map(n => n.x + n.ancho + SEPARACION_NODOS));
  const pendientes = nodos
    .filter(n => n.x === 0 && n.y === 0)
    .sort((a, b) => a.id - b.id)
    .map(n => {
      const x = ajustarArriba(siguienteX);
      siguienteX = x + n.ancho + SEPARACION_NODOS;
      return { ...n, x, y: ajustar((ALTO_LANE_MIN - n.alto) / 2) };
    });
  return [...ubicados, ...pendientes];
}

function altoLane(nodos: NodoDiagrama[]): number {
  const fondo = Math.max(0, ...nodos.map(n => n.y + n.alto + (n.tipo === 'ACTIVIDAD' ? 0 : ALTO_ETIQUETA_EXTERNA)));
  return Math.max(ALTO_LANE_MIN, ajustarArriba(fondo + MARGEN));
}

export function construirLayout(d: ProcesoDiagramaResponse): DiagramaLayout {
  const porLane = new Map<number, NodoDiagrama[]>();
  for (const nodo of nodosDe(d)) {
    porLane.set(nodo.laneId, [...(porLane.get(nodo.laneId) ?? []), nodo]);
  }

  const cajas = new Map<number, CajaDiagrama>();
  let anchoContenido = ANCHO_CONTENIDO_MIN;
  let topPool = 0;

  const pools: PoolDiagrama[] = [...d.pools].sort((a, b) => a.orden - b.orden).map(pool => {
    let topLane = 0;
    const lanes: LaneDiagrama[] = d.lanes
      .filter(lane => lane.poolId === pool.id)
      .sort((a, b) => a.orden - b.orden)
      .map(lane => {
        const nodos = ubicarPendientes(porLane.get(lane.id) ?? []);
        const resultado = { id: lane.id, nombre: lane.nombre, top: topLane, alto: altoLane(nodos), nodos };
        topLane += resultado.alto;
        return resultado;
      });

    const resultado: PoolDiagrama = {
      id: pool.id,
      nombre: pool.nombre,
      cajaNegra: pool.cajaNegra,
      top: topPool,
      alto: lanes.length > 0 ? topLane : ALTO_POOL_SIN_LANES,
      lanes
    };

    for (const lane of lanes) {
      for (const nodo of lane.nodos) {
        cajas.set(nodo.id, {
          tipo: nodo.tipo,
          x: INICIO_CONTENIDO + nodo.x,
          y: topPool + lane.top + nodo.y,
          ancho: nodo.ancho,
          alto: nodo.alto
        });
        anchoContenido = Math.max(anchoContenido, ajustarArriba(nodo.x + nodo.ancho + MARGEN * 2));
      }
    }

    topPool += resultado.alto + SEPARACION_POOLS;
    return resultado;
  });

  return {
    ancho: INICIO_CONTENIDO + anchoContenido,
    alto: Math.max(0, topPool - SEPARACION_POOLS),
    pools,
    cajas
  };
}

function centro(caja: CajaDiagrama): Punto {
  return { x: caja.x + caja.ancho / 2, y: caja.y + caja.alto / 2 };
}

// Rutas ortogonales como las preferidas por BpmnLayouter: 'h:h' por defecto,
// 'v:h' al salir de un gateway y 'h:v' al entrar a uno.
export function rutaSecuencia(origen: CajaDiagrama, destino: CajaDiagrama): Punto[] {
  const co = centro(origen);
  const cd = centro(destino);
  const adelante = cd.x > co.x;
  // Solo se usa el vértice de arriba o de abajo si el otro nodo queda fuera del alto del gateway.
  const fueraDeAltura = (y: number, gateway: CajaDiagrama) => y < gateway.y || y > gateway.y + gateway.alto;

  if (origen.tipo === 'GATEWAY' && adelante && fueraDeAltura(cd.y, origen)) {
    const salidaY = cd.y < co.y ? origen.y : origen.y + origen.alto;
    return [{ x: co.x, y: salidaY }, { x: co.x, y: cd.y }, { x: destino.x, y: cd.y }];
  }

  if (destino.tipo === 'GATEWAY' && adelante && fueraDeAltura(co.y, destino)) {
    const entradaY = co.y < cd.y ? destino.y : destino.y + destino.alto;
    return [{ x: origen.x + origen.ancho, y: co.y }, { x: cd.x, y: co.y }, { x: cd.x, y: entradaY }];
  }

  const inicio = { x: origen.x + origen.ancho, y: co.y };
  const fin = { x: destino.x, y: cd.y };

  if (fin.x - inicio.x >= GRILLA * 2) {
    if (inicio.y === fin.y) {
      return [inicio, fin];
    }
    const medioX = (inicio.x + fin.x) / 2;
    return [inicio, { x: medioX, y: inicio.y }, { x: medioX, y: fin.y }, fin];
  }

  // El destino está detrás del origen: la ruta rodea ambas figuras por debajo.
  const abajo = Math.max(origen.y + origen.alto, destino.y + destino.alto) + MARGEN;
  return [
    inicio,
    { x: inicio.x + MARGEN, y: inicio.y },
    { x: inicio.x + MARGEN, y: abajo },
    { x: fin.x - MARGEN, y: abajo },
    { x: fin.x - MARGEN, y: fin.y },
    fin
  ];
}

// Flujo de mensaje entre pools: 'v:v', sale por arriba o abajo y entra por el lado opuesto.
export function rutaMensaje(origen: CajaDiagrama, destino: CajaDiagrama): Punto[] {
  const co = centro(origen);
  const cd = centro(destino);
  const haciaAbajo = cd.y > co.y;
  const inicio = { x: co.x, y: haciaAbajo ? origen.y + origen.alto : origen.y };
  const fin = { x: cd.x, y: haciaAbajo ? destino.y : destino.y + destino.alto };
  if (inicio.x === fin.x) {
    return [inicio, fin];
  }
  const medioY = (inicio.y + fin.y) / 2;
  return [inicio, { x: inicio.x, y: medioY }, { x: fin.x, y: medioY }, fin];
}

function puntaFlecha(desde: Punto, hasta: Punto): string {
  const angulo = Math.atan2(hasta.y - desde.y, hasta.x - desde.x);
  const largo = 10;
  const abertura = Math.PI / 7;
  const izquierda = {
    x: hasta.x - largo * Math.cos(angulo - abertura),
    y: hasta.y - largo * Math.sin(angulo - abertura)
  };
  const derecha = {
    x: hasta.x - largo * Math.cos(angulo + abertura),
    y: hasta.y - largo * Math.sin(angulo + abertura)
  };
  return `${izquierda.x},${izquierda.y} ${hasta.x},${hasta.y} ${derecha.x},${derecha.y}`;
}

function puntoMedio(puntos: Punto[]): Punto {
  const i = Math.floor((puntos.length - 1) / 2);
  return { x: (puntos[i].x + puntos[i + 1].x) / 2, y: (puntos[i].y + puntos[i + 1].y) / 2 };
}

function conexion(clave: string, tipo: ConexionDiagrama['tipo'], puntos: Punto[], etiqueta: string | null): ConexionDiagrama {
  return {
    clave,
    tipo,
    trazo: puntos.map(p => `${p.x},${p.y}`).join(' '),
    punta: puntaFlecha(puntos[puntos.length - 2], puntos[puntos.length - 1]),
    inicio: puntos[0],
    etiqueta: etiqueta ?? '',
    posicionEtiqueta: puntoMedio(puntos)
  };
}

export function trazarConexiones(
  d: ProcesoDiagramaResponse,
  layout: DiagramaLayout,
  arrastre: { id: number; delta: Punto } | null
): ConexionDiagrama[] {
  const caja = (id: number | null): CajaDiagrama | undefined => {
    const encontrada = id === null ? undefined : layout.cajas.get(id);
    if (!encontrada || arrastre?.id !== id) {
      return encontrada;
    }
    return { ...encontrada, x: encontrada.x + arrastre.delta.x, y: encontrada.y + arrastre.delta.y };
  };

  const conexiones: ConexionDiagrama[] = [];
  for (const arco of d.arcos) {
    const origen = caja(arco.origenId);
    const destino = caja(arco.destinoId);
    if (origen && destino) {
      conexiones.push(conexion(`a${arco.id}`, 'SECUENCIA', rutaSecuencia(origen, destino), arco.etiqueta));
    }
  }
  for (const mensaje of d.mensajes) {
    const origen = caja(mensaje.eventoThrowId);
    const destino = caja(mensaje.eventoCatchId);
    if (origen && destino) {
      conexiones.push(conexion(`m${mensaje.id}`, 'MENSAJE', rutaMensaje(origen, destino), mensaje.nombre));
    }
  }
  return conexiones;
}

export function posicionAlSoltar(layout: DiagramaLayout, nodo: NodoDiagrama, delta: Punto): PosicionNodo {
  const pool = layout.pools.find(p => p.lanes.some(l => l.id === nodo.laneId));
  const actual = pool?.lanes.find(l => l.id === nodo.laneId);
  if (!pool || !actual) {
    return { laneId: nodo.laneId, x: nodo.x, y: nodo.y };
  }

  const yEnPool = actual.top + nodo.y + delta.y;
  const centroY = yEnPool + nodo.alto / 2;
  // Solo las actividades cambian de lane: los requests de gateway y evento no aceptan laneId.
  const lane = nodo.tipo === 'ACTIVIDAD'
    ? pool.lanes.find(l => centroY >= l.top && centroY < l.top + l.alto) ?? actual
    : actual;

  // El mínimo GRILLA evita guardar (0,0), que marca un nodo sin ubicar.
  return {
    laneId: lane.id,
    x: Math.max(GRILLA, ajustar(nodo.x + delta.x)),
    y: Math.min(Math.max(GRILLA, ajustar(yEnPool - lane.top)), lane.alto - nodo.alto)
  };
}

export function aplicarPosicion(
  d: ProcesoDiagramaResponse,
  nodo: NodoDiagrama,
  posicion: PosicionNodo
): ProcesoDiagramaResponse {
  const cambio = { posicionX: posicion.x, posicionY: posicion.y };
  switch (nodo.tipo) {
    case 'ACTIVIDAD':
      return {
        ...d,
        actividades: d.actividades.map(a => a.id === nodo.id ? { ...a, ...cambio, laneId: posicion.laneId } : a)
      };
    case 'GATEWAY':
      return { ...d, gateways: d.gateways.map(g => g.id === nodo.id ? { ...g, ...cambio } : g) };
    case 'EVENTO':
      return { ...d, eventos: d.eventos.map(e => e.id === nodo.id ? { ...e, ...cambio } : e) };
  }
}
