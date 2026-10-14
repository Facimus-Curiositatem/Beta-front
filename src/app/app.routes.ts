import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { LoginComponent } from './pages/login/login.component';
import { ProcesoFormComponent } from './pages/proceso-form/proceso-form.component';
import { ProcesoListComponent } from './pages/proceso-list/proceso-list.component';

// Las rutas especificas van antes que las genericas.
export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'procesos/nuevo', component: ProcesoFormComponent, canActivate: [authGuard] },
  { path: 'procesos/editar/:id', component: ProcesoFormComponent, canActivate: [authGuard] },
  { path: 'procesos', component: ProcesoListComponent, canActivate: [authGuard] },
  { path: '', redirectTo: 'procesos', pathMatch: 'full' },
  { path: '**', redirectTo: 'procesos' },
];
