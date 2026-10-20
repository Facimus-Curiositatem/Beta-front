import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./components/login/login.component').then(m => m.LoginComponent)
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
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: '**',
    redirectTo: 'login'
  }
];
