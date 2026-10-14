import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';

import { Usuario } from '../../models/usuario.model';
import { AuthService } from '../../service/auth.service';
import { TokenService } from '../../service/token.service';

/** Pantalla posterior al login; se reemplaza al construir la siguiente pantalla. */
@Component({
  selector: 'app-home',
  imports: [],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent {
  private authService = inject(AuthService);
  private tokenService = inject(TokenService);
  private router = inject(Router);

  usuario: Usuario | null = this.tokenService.obtenerUsuario();

  cerrarSesion(): void {
    // Sin estado en el servidor: aunque el aviso falle, la sesion local se borra igual.
    this.authService.logout().subscribe({
      next: () => this.salir(),
      error: () => this.salir(),
    });
  }

  private salir(): void {
    this.tokenService.borrar();
    this.router.navigate(['/login']);
  }
}
