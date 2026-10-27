import { adminGuard } from './guards/admin.guard';
import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: 'roles',
    canActivate: [adminGuard],
    loadComponent: () =>
      import('./components/rol-proceso-list/rol-proceso-list.component').then(
        (m) => m.RolProcesoListComponent
      )
  },
  {
    path: 'roles/nuevo',
    canActivate: [adminGuard],
    loadComponent: () =>
      import('./components/rol-proceso-form/rol-proceso-form.component').then(
        (m) => m.RolProcesoFormComponent
      )
  },
  {
    path: 'roles/:id/editar',
    canActivate: [adminGuard],
    loadComponent: () =>
      import('./components/rol-proceso-form/rol-proceso-form.component').then(
        (m) => m.RolProcesoFormComponent
      )
  },
  {
    path: 'permisos-estructura',
    canActivate: [adminGuard],
    loadComponent: () =>
      import('./components/permiso-estructura/permiso-estructura.component').then(
        (m) => m.PermisoEstructuraComponent
      )
  },
  {
    path: 'procesos/:id/compartir',
    canActivate: [adminGuard],
    loadComponent: () =>
      import('./components/compartir-proceso/compartir-proceso.component').then(
        (m) => m.CompartirProcesoComponent
      )
  },
  {
    path: 'procesos-compartidos',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./components/procesos-compartidos-list/procesos-compartidos-list.component').then(
        (m) => m.ProcesosCompartidosListComponent
      )
  },
  {
    path: 'procesos-compartidos/:id',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./components/proceso-compartido-detalle/proceso-compartido-detalle.component').then(
        (m) => m.ProcesoCompartidoDetalleComponent
      )
  },
  {
    path: 'registro',
    loadComponent: () =>
      import('./components/registro-empresa/registro-empresa.component').then(
        (m) => m.RegistroEmpresaComponent
      )
  },
  {
    path: 'procesos',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./components/inicio-procesos/inicio-procesos.component').then(
        (m) => m.InicioProcesosComponent
      )
  },
  {
    path: 'login',
    loadComponent: () => import('./components/login/login.component').then((m) => m.LoginComponent)
  },
  {
    path: 'procesos',
    loadComponent: () => import('./components/proceso-list/proceso-list.component').then(m => m.ProcesoListComponent),
    canActivate: [authGuard]
  },
  {
    path: 'procesos/nuevo',
    loadComponent: () => import('./components/proceso-form/proceso-form.component').then(m => m.ProcesoFormComponent),
    canActivate: [authGuard]
  },
  {
    path: 'procesos/:id',
    loadComponent: () => import('./components/proceso-detalle/proceso-detalle.component').then(m => m.ProcesoDetalleComponent),
    canActivate: [authGuard]
  },
  {
    path: 'procesos/:id/editar',
    loadComponent: () => import('./components/proceso-form/proceso-form.component').then(m => m.ProcesoFormComponent),
    canActivate: [authGuard]
  },
  {
    path: 'procesos/:procesoId/pools',
    loadComponent: () =>
      import('./components/pool-list/pool-list.component').then((m) => m.PoolListComponent),
    canActivate: [authGuard]
  },
  {
    path: 'procesos/:procesoId/pools/nuevo',
    loadComponent: () =>
      import('./components/pool-form/pool-form.component').then((m) => m.PoolFormComponent),
    canActivate: [authGuard]
  },
  {
    path: 'procesos/:procesoId/pools/:id/editar',
    loadComponent: () =>
      import('./components/pool-form/pool-form.component').then((m) => m.PoolFormComponent),
    canActivate: [authGuard]
  },
  {
    path: 'pools/:id/lanes',
    loadComponent: () =>
      import('./components/lane-list/lane-list.component').then((m) => m.LaneListComponent),
    canActivate: [authGuard]
  },
  {
    path: 'pools/:poolId/lanes/nuevo',
    loadComponent: () =>
      import('./components/lane-form/lane-form.component').then((m) => m.LaneFormComponent),
    canActivate: [authGuard]
  },
  {
    path: 'pools/:poolId/lanes/:laneId/editar',
    loadComponent: () =>
      import('./components/lane-form/lane-form.component').then((m) => m.LaneFormComponent),
    canActivate: [authGuard]
  },
    {
    path: 'lanes/:laneId/actividades',
    loadComponent: () => import('./components/actividad-list/actividad-list.component').then(m => m.ActividadListComponent),
    canActivate: [authGuard]
  },
  {
    path: 'lanes/:laneId/actividades/nuevo',
    loadComponent: () => import('./components/actividad-form/actividad-form.component').then(m => m.ActividadFormComponent),
    canActivate: [authGuard]
  },
  {
    path: 'lanes/:laneId/actividades/:id/editar',
    loadComponent: () => import('./components/actividad-form/actividad-form.component').then(m => m.ActividadFormComponent),
    canActivate: [authGuard]
  },
  {
    path: 'lanes/:laneId/gateways',
    loadComponent: () => import('./components/gateway-list/gateway-list.component').then(m => m.GatewayListComponent),
    canActivate: [authGuard]
  },
  {
    path: 'lanes/:laneId/gateways/nuevo',
    loadComponent: () => import('./components/gateway-form/gateway-form.component').then(m => m.GatewayFormComponent),
    canActivate: [authGuard]
  },
  {
    path: 'lanes/:laneId/gateways/:id/editar',
    loadComponent: () => import('./components/gateway-form/gateway-form.component').then(m => m.GatewayFormComponent),
    canActivate: [authGuard]
  },
  {
    path: 'usuarios',
    loadComponent: () => import('./components/usuario-list/usuario-list.component').then(m => m.UsuarioListComponent),
    canActivate: [authGuard]
  },
  {
    path: 'usuarios/nuevo',
    loadComponent: () => import('./components/usuario-form/usuario-form.component').then(m => m.UsuarioFormComponent),
    canActivate: [authGuard]
  },
  {
    path: 'usuarios/invitar',
    loadComponent: () => import('./components/invitacion-form/invitacion-form.component').then(m => m.InvitacionFormComponent),
    canActivate: [authGuard]
  },
  {
    path: 'usuarios/:id/editar',
    loadComponent: () => import('./components/editar-usuario/editar-usuario.component').then(m => m.EditarUsuarioComponent),
    canActivate: [authGuard]
  },
  {
    path: 'invitaciones/:token/aceptar',
    loadComponent: () => import('./components/aceptar-invitacion/aceptar-invitacion.component').then(m => m.AceptarInvitacionComponent)
  },
  {
    path: 'lanes/:laneId/eventos-mensaje',
    loadComponent: () => import('./components/evento-mensaje-list/evento-mensaje-list.component').then(m => m.EventoMensajeListComponent),
    canActivate: [authGuard]
  },
  {
    path: 'lanes/:laneId/eventos-mensaje/nuevo',
    loadComponent: () => import('./components/evento-mensaje-form/evento-mensaje-form.component').then(m => m.EventoMensajeFormComponent),
    canActivate: [authGuard]
  },
  {
    path: 'lanes/:laneId/eventos-mensaje/:eventoId/editar',
    loadComponent: () => import('./components/evento-mensaje-form/evento-mensaje-form.component').then(m => m.EventoMensajeFormComponent),
    canActivate: [authGuard]
  },
  {
    path: 'procesos/:procesoId/mensajes',
    loadComponent: () => import('./components/mensaje-list/mensaje-list.component').then(m => m.MensajeListComponent),
    canActivate: [authGuard]
  },
  {
    path: 'procesos/:procesoId/mensajes/nuevo',
    loadComponent: () => import('./components/mensaje-form/mensaje-form.component').then(m => m.MensajeFormComponent),
    canActivate: [authGuard]
  },
  {
    path: 'procesos/:procesoId/mensajes/:mensajeId/editar',
    loadComponent: () => import('./components/mensaje-form/mensaje-form.component').then(m => m.MensajeFormComponent),
    canActivate: [authGuard]
  },
  {
    path: 'pools/:poolId/arcos',
    loadComponent: () => import('./components/arco-list/arco-list.component').then(m => m.ArcoListComponent),
    canActivate: [authGuard]
  },
  {
    path: 'pools/:poolId/arcos/nuevo',
    loadComponent: () => import('./components/arco-form/arco-form.component').then(m => m.ArcoFormComponent),
    canActivate: [authGuard]
  },
  {
    path: 'pools/:poolId/arcos/:arcoId/editar',
    loadComponent: () => import('./components/arco-form/arco-form.component').then(m => m.ArcoFormComponent),
    canActivate: [authGuard]
  },
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: '**',
    redirectTo: 'login'
  }
];