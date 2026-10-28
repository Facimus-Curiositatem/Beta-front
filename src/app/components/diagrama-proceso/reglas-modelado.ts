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

export function opcionesDelPool(d: ProcesoDiagramaResponse, poolId: number | undefined): OpcionNodo[] {
  const lanes = new Set(d.lanes.filter(l => l.poolId === poolId).map(l => l.id));
  return nodosDelProceso(d)
    .filter(n => lanes.has(n.laneId))
    .map(n => ({ id: n.id, nombre: n.nombre, requiereCondicion: requiereCondicion(d, n.id) }));
}
