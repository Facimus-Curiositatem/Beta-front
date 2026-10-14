import { Component, inject } from '@angular/core';

import { AuthService } from '../../core/services/auth.service';

/** Placeholder de la pantalla posterior al login; se reemplaza al mapear la siguiente pantalla. */
@Component({
  selector: 'app-home',
  template: `
    <p>Sesión iniciada como {{ auth.usuario()?.nombre }} ({{ auth.usuario()?.rolAcceso }})</p>
    <button type="button" (click)="auth.logout()">Cerrar sesión</button>
  `,
})
export class HomeComponent {
  readonly auth = inject(AuthService);
}
