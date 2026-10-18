import { Routes } from '@angular/router';

import { UsuarioListComponent } from './components/usuario-list/usuario-list.component';
import { UsuarioFormComponent } from './components/usuario-form/usuario-form.component';
import { EditarUsuarioComponent } from './components/editar-usuario/editar-usuario.component';
import { InvitacionFormComponent } from './components/invitacion-form/invitacion-form.component';
import { AceptarInvitacionComponent } from './components/aceptar-invitacion/aceptar-invitacion.component';

export const routes: Routes = [
  { path: 'usuarios', component: UsuarioListComponent },
  { path: 'usuarios/nuevo', component: UsuarioFormComponent },
  { path: 'usuarios/invitar', component: InvitacionFormComponent },
  { path: 'usuarios/:id/editar', component: EditarUsuarioComponent },
  { path: 'invitaciones/:token/aceptar', component: AceptarInvitacionComponent },
];