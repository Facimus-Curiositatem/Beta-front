import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
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
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: '**',
    redirectTo: 'login'
  }
];