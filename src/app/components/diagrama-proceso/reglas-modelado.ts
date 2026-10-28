import { ProcesoDiagramaResponse } from '../../models/proceso.model';
import { NodoDiagrama, OpcionNodo, TipoNodoDiagrama } from '../../models/diagrama.model';

// Reglas inspiradas en BpmnRules de bpmn-js. Solo orientan la interfaz: el backend tiene la última palabra.

interface NodoProceso {
  id: number;
  nombre: string;
  tipo: TipoNodoDiagrama;
  subtipo: NodoDiagrama['subtipo'];
  laneId: number;
}

export function nodosDelProceso(d: ProcesoDiagramaResponse): NodoProceso[] {
  return [
    ...d.actividades.map(a => ({ id: a.id, nombre: a.nombre, tipo: 'ACTIVIDAD' as const, subtipo: a.tipoActividad, laneId: a.laneId })),
    ...d.gateways.map(g => ({ id: g.id, nombre: g.nombre, tipo: 'GATEWAY' as const, subtipo: g.tipoGateway, laneId: g.laneId })),
    ...d.eventos.map(e => ({ id: e.id, nombre: e.nombre, tipo: 'EVENTO' as const, subtipo: e.tipoEvento, laneId: e.laneId }))
  ];
}

export function buscarNodo(d: ProcesoDiagramaResponse, id: number): NodoProceso | undefined {
  return nodosDelProceso(d).find(n => n.id === id);
}

export function poolDeNodo(d: ProcesoDiagramaResponse, id: number): number | undefined {
  const laneId = buscarNodo(d, id)?.laneId;
  return d.lanes.find(l => l.id === laneId)?.poolId;
}

export function requiereCondicion(d: ProcesoDiagramaResponse, origenId: number): boolean {
  const gateway = d.gateways.find(g => g.id === origenId);
  return gateway !== undefined && gateway.tipoGateway !== 'PARALELO';
}

// Un Message Throw hacia un Message Catch de otro pool se modela como mensaje, no como arco.
export function esMensajePosible(d: ProcesoDiagramaResponse, origenId: number, destinoId: number): boolean {
  const origen = d.eventos.find(e => e.id === origenId);
  const destino = d.eventos.find(e => e.id === destinoId);
  return origen?.tipoEvento === 'THROW'
    && destino !== undefined
    && destino.tipoEvento !== 'THROW'
    && poolDeNodo(d, origenId) !== poolDeNodo(d, destinoId);
}

export function motivoNoConectable(
  d: ProcesoDiagramaResponse,
  origenId: number,
  destinoId: number,
  arcoIgnorado?: number
): string | null {
  if (origenId === destinoId) {
    return 'Un arco no puede tener el mismo nodo como origen y destino.';
  }
  if (poolDeNodo(d, origenId) !== poolDeNodo(d, destinoId)) {
    return 'El origen y el destino de un arco deben estar en el mismo pool; entre pools se usa un mensaje.';
  }
  if (d.arcos.some(a => a.id !== arcoIgnorado && a.origenId === origenId && a.destinoId === destinoId)) {
    return 'Ya existe un arco entre estos dos nodos.';
  }
  if (d.eventos.some(e => e.id === destinoId && e.tipoEvento === 'CATCH_INICIO')) {
    return 'Un Message Catch de inicio no puede tener arcos entrantes.';
  }
  return null;
}

function mensajeAmbiguo(d: ProcesoDiagramaResponse, nombre: string, clave: string): boolean {
  return d.mensajes.some(m =>
    m.nombre.toLowerCase() === nombre.toLowerCase()
    && (m.claveCorrelacion ?? '').toLowerCase() === clave.toLowerCase());
}

// El backend exige que el mensaje se llame igual que su Throw y su Catch, con la misma clave de correlación.
export function motivoNoMensajeACatch(d: ProcesoDiagramaResponse, throwId: number, catchId: number): string | null {
  const envio = d.eventos.find(e => e.id === throwId);
  const recepcion = d.eventos.find(e => e.id === catchId);
  if (!envio || !recepcion || recepcion.tipoEvento === 'THROW') {
    return 'El receptor de un mensaje debe ser un Message Catch.';
  }
  if (poolDeNodo(d, throwId) === poolDeNodo(d, catchId)) {
    return 'Un mensaje debe conectar dos pools diferentes.';
  }
  if (envio.nombre.toLowerCase() !== recepcion.nombre.toLowerCase()) {
    return `El Message Catch debe llamarse «${envio.nombre}» para recibir este mensaje.`;
  }
  if (envio.claveCorrelacion.toLowerCase() !== recepcion.claveCorrelacion.toLowerCase()) {
    return 'La clave de correlación del Catch debe coincidir con la del Throw.';
  }
  if (mensajeAmbiguo(d, envio.nombre, envio.claveCorrelacion)) {
    return 'Ya existe un mensaje con ese nombre y clave de correlación en el proceso.';
  }
  return null;
}

export function motivoNoMensajeAPool(d: ProcesoDiagramaResponse, throwId: number, poolId: number): string | null {
  const envio = d.eventos.find(e => e.id === throwId);
  const pool = d.pools.find(p => p.id === poolId);
  if (!envio || !pool) {
    return 'Solo un Message Throw puede enviar mensajes a otro pool.';
  }
  if (poolDeNodo(d, throwId) === poolId) {
    return 'Un mensaje debe conectar dos pools diferentes.';
  }
  if (!pool.cajaNegra) {
    return 'Este pool tiene lanes: conecta el mensaje con su Message Catch.';
  }
  if (mensajeAmbiguo(d, envio.nombre, envio.claveCorrelacion)) {
    return 'Ya existe un mensaje con ese nombre y clave de correlación en el proceso.';
  }
  return null;
}

export function esPoolExterno(d: ProcesoDiagramaResponse, poolId: number): boolean {
  const pool = d.pools.find(p => p.id === poolId);
  return pool?.tipoParticipante === 'SISTEMA_EXTERNO' && pool.cajaNegra;
}

// Desde un Message Throw hacia otro pool se crea un mensaje; en cualquier otro caso, un arco.
export function motivoDestino(d: ProcesoDiagramaResponse, origenId: number, destinoId: number): string | null {
  const desdeEnvio = d.eventos.some(e => e.id === origenId && e.tipoEvento === 'THROW');
  if (desdeEnvio && poolDeNodo(d, origenId) !== poolDeNodo(d, destinoId)) {
    return motivoNoMensajeACatch(d, origenId, destinoId);
  }
  return motivoNoConectable(d, origenId, destinoId);
}

export function revisarModelo(d: ProcesoDiagramaResponse): string[] {
  const advertencias: string[] = [];
  const nombre = (id: number) => buscarNodo(d, id)?.nombre ?? '';
  const entradas = (id: number) => d.arcos.filter(a => a.destinoId === id).length;
  const salidas = (id: number) => d.arcos.filter(a => a.origenId === id).length;

  for (const nodo of [...d.actividades, ...d.gateways]) {
    if (entradas(nodo.id) === 0) {
      advertencias.push(`«${nodo.nombre}» no tiene camino de entrada.`);
    }
    if (salidas(nodo.id) === 0) {
      advertencias.push(`«${nodo.nombre}» no tiene camino de salida.`);
    }
  }
  for (const gateway of d.gateways) {
    if (entradas(gateway.id) < 2 && salidas(gateway.id) < 2) {
      advertencias.push(`El gateway «${gateway.nombre}» no ramifica ni une caminos: necesita al menos dos arcos salientes.`);
    }
    if (gateway.tipoGateway !== 'PARALELO') {
      for (const arco of d.arcos.filter(a => a.origenId === gateway.id && !a.condicion)) {
        advertencias.push(`El arco «${gateway.nombre} → ${nombre(arco.destinoId)}» necesita condición.`);
      }
    }
  }
  for (const mensaje of d.mensajes.filter(m => m.sinReceptor)) {
    advertencias.push(`El mensaje «${mensaje.nombre}» queda sin receptor.`);
  }
  for (const evento of d.eventos) {
    if (evento.tipoEvento === 'THROW' && !d.mensajes.some(m => m.eventoThrowId === evento.id)) {
      advertencias.push(`El envío «${evento.nombre}» no tiene mensaje: conéctalo a un Message Catch de otro pool.`);
    }
    if (evento.tipoEvento !== 'THROW' && !evento.origenExterno && !d.mensajes.some(m => m.eventoCatchId === evento.id)) {
      advertencias.push(`«${evento.nombre}» no recibe ningún mensaje: conéctale un Message Throw o márcalo como de origen externo.`);
    }
  }
  return advertencias;
}

export function opcionesDelPool(d: ProcesoDiagramaResponse, poolId: number | undefined): OpcionNodo[] {
  const lanes = new Set(d.lanes.filter(l => l.poolId === poolId).map(l => l.id));
  return nodosDelProceso(d)
    .filter(n => lanes.has(n.laneId))
    .map(n => ({ id: n.id, nombre: n.nombre, requiereCondicion: requiereCondicion(d, n.id) }));
}
