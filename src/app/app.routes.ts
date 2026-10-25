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
