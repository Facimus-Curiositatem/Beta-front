import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./components/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'procesos/:procesoId/pools',
    loadComponent: () => import('./components/pool-list/pool-list.component').then(m => m.PoolListComponent),
    canActivate: [authGuard]
  },
  {
    path: 'procesos/:procesoId/pools/nuevo',
    loadComponent: () => import('./components/pool-form/pool-form.component').then(m => m.PoolFormComponent),
    canActivate: [authGuard]
  },
  {
    path: 'procesos/:procesoId/pools/:id/editar',
    loadComponent: () => import('./components/pool-form/pool-form.component').then(m => m.PoolFormComponent),
    canActivate: [authGuard]
  },
  {
    path: 'pools/:id/lanes',
    loadComponent: () => import('./components/lane-list/lane-list.component').then(m => m.LaneListComponent),
    canActivate: [authGuard]
  },
  {
    path: 'pools/:poolId/lanes/nuevo',
    loadComponent: () => import('./components/lane-form/lane-form.component').then(m => m.LaneFormComponent),
    canActivate: [authGuard]
  },
  {
    path: 'pools/:poolId/lanes/:laneId/editar',
    loadComponent: () => import('./components/lane-form/lane-form.component').then(m => m.LaneFormComponent),
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
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: '**',
    redirectTo: 'login'
  }
];
