import {
  ProcesoCompartidoResponse,
  ProcesoCompartidoDetalleResponse
} from '../models/proceso-compartido.model';
export const compartido: ProcesoCompartidoResponse = {
  id: 50,
  procesoId: 10,
  procesoNombre: 'Compra',
  empresaPropietariaId: 1,
  empresaPropietaria: 'Beta',
  empresaInvitadaId: 8,
  empresaInvitada: 'Aliada',
  soloLectura: true
};
export const detalleCompartido: ProcesoCompartidoDetalleResponse = {
  proceso: {
    id: 10,
    nombre: 'Compra',
    descripcion: 'Adquisiciones',
    categoria: 'Compras',
    estado: 'BORRADOR',
    activo: true,
    fechaCreacion: '2026-10-24',
    fechaModificacion: '2026-10-24'
  },
  empresaPropietaria: 'Beta',
  soloLectura: true,
  pools: [
    {
      id: 1,
      nombre: 'Pool Beta',
      tipoParticipante: 'EMPRESA',
      cajaNegra: false,
      orden: 0,
      procesoId: 10
    }
  ],
  lanes: [
    {
      id: 2,
      nombre: 'Lane ventas',
      orden: 0,
      poolId: 1,
      rolProcesoId: 3,
      rolProcesoNombre: 'Vendedor'
    }
  ],
  actividades: [
    {
      id: 4,
      nombre: 'Cotizar',
      descripcion: null,
      posicionX: 0,
      posicionY: 0,
      laneId: 2,
      tipoActividad: 'TAREA'
    }
  ],
  gateways: [
    { id: 5, nombre: 'Aprobación', tipoGateway: 'EXCLUSIVO', posicionX: 0, posicionY: 0, laneId: 2 }
  ],
  eventos: [
    {
      id: 6,
      nombre: 'Solicitud',
      tipoEvento: 'THROW',
      contenido: null,
      claveCorrelacion: null,
      posicionX: 0,
      posicionY: 0,
      laneId: 2,
      origenExterno: false
    }
  ],
  arcos: [
    { id: 7, etiqueta: 'Sí aprobado', condicion: null, origenId: 4, destinoId: 5, poolId: 1 }
  ],
  mensajes: [
    {
      id: 8,
      nombre: 'Avisar',
      contenido: null,
      poolOrigenId: 1,
      poolDestinoId: 9,
      procesoId: 10,
      eventoThrowId: 6,
      eventoCatchId: null,
      claveCorrelacion: null,
      tipoDestinoExterno: null,
      destinoExterno: null,
      politicaFalloNotificacion: null,
      actividadErrorId: null,
      politicaSinCaso: null,
      sinReceptor: true
    }
  ]
};
