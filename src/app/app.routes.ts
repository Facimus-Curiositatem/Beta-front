import { Routes } from '@angular/router';
import { adminGuard } from './guards/admin.guard';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
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
    path: 'registro',
    loadComponent: () =>
      import('./components/registro-empresa/registro-empresa.component').then(
        (m) => m.RegistroEmpresaComponent
      )
  },
  {
    path: 'procesos',
    loadComponent: () =>
      import('./components/inicio-procesos/inicio-procesos.component').then(
        (m) => m.InicioProcesosComponent
      ),
    canActivate: [authGuard]
  },
  {
    path: 'login',
    loadComponent: () => import('./components/login/login.component').then((m) => m.LoginComponent)
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
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: '**',
    redirectTo: 'login'
  }
];
