import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { UsuarioListComponent } from './components/usuario-list/usuario-list.component';
import { UsuarioFormComponent } from './components/usuario-form/usuario-form.component';
import { EditarUsuarioComponent } from './components/editar-usuario/editar-usuario.component';
import { InvitacionFormComponent } from './components/invitacion-form/invitacion-form.component';
import { AceptarInvitacionComponent } from './components/aceptar-invitacion/aceptar-invitacion.component';

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
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  { path: 'usuarios', component: UsuarioListComponent, canActivate: [authGuard] },
  { path: 'usuarios/nuevo', component: UsuarioFormComponent, canActivate: [authGuard] },
  { path: 'usuarios/invitar', component: InvitacionFormComponent, canActivate: [authGuard] },
  { path: 'usuarios/:id/editar', component: EditarUsuarioComponent, canActivate: [authGuard] },
  { path: 'invitaciones/:token/aceptar', component: AceptarInvitacionComponent },
  {
    path: '**',
    redirectTo: 'login'
  }
];